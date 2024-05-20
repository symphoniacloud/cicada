import { OnEventRequest, OnEventResponse } from 'aws-cdk-lib/custom-resources/lib/provider-framework/types'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../../app/middleware/standardMiddleware'
import { throwFunction } from '../../../multipleContexts/errors'
import fs from 'node:fs/promises'
import { logger } from '../../../app/util/logging'
import { realAthena } from '../../../app/outboundInterfaces/athenaWrapper'
import { sleep } from '../../../../test/remote/integrationTestSupport/utils'
import { Extract } from 'unzipper'
import { realS3 } from '../../../app/outboundInterfaces/s3Wrapper'

// TOEventually - look at "important cases to handle" at https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html#important-cases-to-handle
export async function onEvent(event: OnEventRequest): Promise<OnEventResponse> {
  const props = readProperties(event)
  switch (event.RequestType) {
    case 'Create':
    case 'Update':
      return await runUpMigrations(props)
    case 'Delete':
      return await runDownMigrations(props)
  }
}

type MigrationsProperties = {
  migrationsBucketName: string
  migrationsKey: string
  databaseName: string
  tableBucketName: string
  workGroupName: string
}

function readProperties(event: OnEventRequest): MigrationsProperties {
  const migrationsBucketName =
    event.ResourceProperties.MigrationsBucketName ??
    throwFunction('MigrationsBucketName property is required')()
  if (!(typeof migrationsBucketName === 'string'))
    throw new Error(`Invalid type of MigrationsBucketName property "${migrationsBucketName}`)

  const migrationsKey =
    event.ResourceProperties.MigrationsKey ?? throwFunction('MigrationsKey property is required')()
  if (!(typeof migrationsKey === 'string'))
    throw new Error(`Invalid type of MigrationsKey property "${migrationsKey}`)

  const databaseName =
    event.ResourceProperties.DatabaseName ?? throwFunction('DatabaseName property is required')()
  if (!(typeof databaseName === 'string'))
    throw new Error(`Invalid type of DatabaseName property "${databaseName}`)

  const tableBucketName =
    event.ResourceProperties.TableBucketName ?? throwFunction('TableBucketName property is required')()
  if (!(typeof tableBucketName === 'string'))
    throw new Error(`Invalid type of TableBucketName property "${tableBucketName}`)

  const workGroupName = event.ResourceProperties.WorkGroupName
  if (workGroupName && !(typeof workGroupName === 'string'))
    throw new Error(`Invalid type of WorkGroupName property "${workGroupName}`)

  return {
    migrationsBucketName,
    migrationsKey,
    databaseName,
    tableBucketName,
    workGroupName
  }
}

export async function runUpMigrations(props: MigrationsProperties): Promise<OnEventResponse> {
  logger.info('Attempting to run *UP* migrations')
  await runMigrations(props, await getMigrations(props, 'up'))
  return {}
}

async function runDownMigrations(props: MigrationsProperties): Promise<OnEventResponse> {
  logger.info('Attempting to run *DOWN* migrations')
  await runMigrations(props, (await getMigrations(props, 'down')).reverse())
  return {}
}

async function getMigrations(
  { migrationsBucketName, migrationsKey, databaseName, tableBucketName }: MigrationsProperties,
  direction: string
) {
  const localDirectory = '/tmp/migrations'
  await fs.rm(localDirectory, { force: true, recursive: true })
  await fs.mkdir(localDirectory, { recursive: true })

  logger.info(`Attempting to download s3://${migrationsBucketName}/${migrationsKey} to ${localDirectory}`)

  await (await realS3().getObject(migrationsBucketName, migrationsKey))
    .pipe(Extract({ path: localDirectory }))
    .promise()

  logger.info('Got migrations')

  const migrationFiles = (await fs.readdir(`${localDirectory}/${direction}`)).sort()

  logger.info(`Found ${migrationFiles.length} migration(s)`)

  const migrations = []
  for (const migrationFile of migrationFiles) {
    migrations.push(await fs.readFile(`${localDirectory}/${direction}/${migrationFile}`, 'utf8'))
  }

  return migrations.map((m) =>
    m.replaceAll('%%DATABASE_NAME%%', databaseName).replaceAll('%%BUCKET_NAME%%', tableBucketName)
  )
}

async function runMigrations(props: MigrationsProperties, migrations: string[]) {
  for (const migration of migrations) {
    await runMigration(props, migration)
  }
}

async function runMigration(props: MigrationsProperties, queryString: string) {
  logger.info(`Attempting to run migration`, { queryString })
  const executionId = await startQuery(props, queryString)
  await waitForQueryToComplete(executionId)
}

async function startQuery({ workGroupName }: MigrationsProperties, queryString: string) {
  const result = await realAthena().startQuery(queryString, workGroupName ? { WorkGroup: workGroupName } : {})
  return (
    result.QueryExecutionId ??
    throwFunction(
      'Request to create table was made but no execution ID was returned. Aborting operation, but manual cleanup maybe required.'
    )()
  )
}

async function waitForQueryToComplete(executionId: string) {
  for (let i = 0; i < 60; i++) {
    if (await queryComplete(executionId)) return
    await sleep(2000)
  }
}

async function queryComplete(executionId: string): Promise<boolean> {
  const result = await realAthena().getQuery(executionId)
  const state = result.QueryExecution?.Status?.State
  if (state === 'QUEUED' || state === 'RUNNING') {
    logger.info(`Query is ${state}`)
    return false
  } else if (state === 'SUCCEEDED') {
    logger.info(`Query complete`)
    return true
  } else {
    logger.error(`Error, state is ${state}`)
    throw new Error('Failed - manual cleanup may be required')
  }
}

export const handler = middy(onEvent).use(powertoolsMiddlewares)
