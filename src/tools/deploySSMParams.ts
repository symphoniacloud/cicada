import * as dotenv from 'dotenv'
import { createFullParameterName, SSM_PARAM_NAMES, SsmParamName } from '../multipleContexts/ssmParams'
import path from 'path'
import { getFromLocalEnv, LocalEnvVar } from '../multipleContexts/environmentVariables'
import { userInfo } from 'node:os'
import { ParameterType, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

// This is necessary because as of 2024-02-22 CloudFormation doesn't support saving SSM Params with secret values
// See https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/82

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  const appName = process.env['APP_NAME'] ?? `cicada-${userInfo().username}`
  console.log(`Using appName ${appName} - all SSM parameters will be under /${appName}/`)
  await Promise.all([
    writeParam(appName, SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY, 'WEB_PUSH_VAPID_PUBLIC_KEY'),
    writeParam(appName, SSM_PARAM_NAMES.WEB_PUSH_SUBJECT, 'WEB_PUSH_SUBJECT'),
    writeSecretParam(appName, SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY, 'WEB_PUSH_VAPID_PRIVATE_KEY')
  ])
}

async function writeParam(appName: string, key: SsmParamName, envVarName: LocalEnvVar) {
  const value = getFromLocalEnv(envVarName)
  console.log(`Saving SSM Parameter ${key} as ${value}`)
  await writeSSMParameter(appName, key, value)
}

async function writeSecretParam(appName: string, key: SsmParamName, envVarName: LocalEnvVar) {
  const value = getFromLocalEnv(envVarName)
  console.log(`Saving Secret SSM Parameter ${key}`)
  await writeSSMParameter(appName, key, value, ParameterType.SECURE_STRING)
}

const ssmClient = new SSMClient()

async function writeSSMParameter(
  appName: string,
  key: SsmParamName,
  value: string,
  type: ParameterType = ParameterType.STRING
) {
  await ssmClient.send(
    new PutParameterCommand({
      Name: createFullParameterName({ appName }, key),
      Value: value,
      Type: type,
      Overwrite: true
    })
  )
}

// noinspection JSIgnoredPromiseFromCall
run()
