import { Aws, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { AttributeType, StreamViewType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { saveInSSMViaCloudFormation } from '../support/ssm'
import { AllStacksProps } from '../config/allStacksProps'
import { BlockPublicAccess, Bucket, IBucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import {
  SSM_PARAM_NAMES,
  SsmParamName,
  ssmTableNamePath,
  ssmTableStreamPath
} from '../../multipleContexts/ssmParams'
import { CICADA_TABLE_IDS, CicadaTableId, tableConfigurations } from '../../multipleContexts/dynamoDBTables'
import { CfnDatabase } from 'aws-cdk-lib/aws-glue'
import { CfnWorkGroup } from 'aws-cdk-lib/aws-athena'
import { AthenaMigrations } from '../constructs/AthenaMigrations'

export class StorageStack extends Stack {
  constructor(scope: Construct, id: string, props: AllStacksProps) {
    super(scope, id, props)

    for (const tableId of CICADA_TABLE_IDS) {
      defineTable(this, props, tableId)
    }

    defineBucket(this, props, 'EventsBucket', SSM_PARAM_NAMES.EVENTS_BUCKET_NAME, { expirationDays: 14 })
    defineBucket(this, props, 'ReportingIngestionBucket', SSM_PARAM_NAMES.REPORTING_INGESTION_BUCKET_NAME, {
      expirationDays: 14
    })
    const reportingBucket = defineBucket(
      this,
      props,
      'ReportingBucket',
      SSM_PARAM_NAMES.REPORTING_BUCKET_NAME
    )
    const athenaOutputBucket = defineBucket(
      this,
      props,
      'AthenaOutputBucket',
      SSM_PARAM_NAMES.ATHENA_OUTPUT_BUCKET_NAME,
      {
        expirationDays: 7
      }
    )

    const glueDatabaseName = defineGlueDatabase(this, props)
    const { athenaWorkgroup, athenaWorkgroupName } = defineAthenaWorkgroup(this, props, athenaOutputBucket)

    const athenaMigrations = new AthenaMigrations(this, 'athenaMigrations', {
      ...props,
      glueDatabaseName,
      tableBucket: reportingBucket,
      athenaBucket: athenaOutputBucket,
      workGroupName: athenaWorkgroupName
    })
    athenaMigrations.node.addDependency(athenaWorkgroup)
    athenaMigrations.node.addDependency(athenaOutputBucket)
    athenaMigrations.node.addDependency(reportingBucket)
  }
}

function defineTable(scope: Construct, props: AllStacksProps, tableId: CicadaTableId) {
  const config = tableConfigurations[tableId]
  const table = new TableV2(scope, `${tableId}-table`, {
    tableName: `${props.appName}-${tableId}`,
    timeToLiveAttribute: 'ttl',
    pointInTimeRecovery: true,
    removalPolicy: props.storageResourceRemovalPolicy,
    partitionKey: {
      name: 'PK',
      type: AttributeType.STRING
    },
    ...(config.stream
      ? {
          dynamoStream: StreamViewType.NEW_IMAGE
        }
      : {}),
    ...(config.hasSortKey
      ? {
          sortKey: {
            name: 'SK',
            type: AttributeType.STRING
          }
        }
      : {}),
    ...(config.hasGSI1
      ? {
          globalSecondaryIndexes: [
            {
              indexName: 'GSI1',
              partitionKey: {
                name: 'GSI1PK',
                type: AttributeType.STRING
              },
              sortKey: {
                name: 'GSI1SK',
                type: AttributeType.STRING
              }
            }
          ]
        }
      : {})
  })

  saveInSSMViaCloudFormation(scope, props, ssmTableNamePath(tableId), table.tableName)

  if (config.stream) {
    if (tableId !== 'github-repo-activity')
      throw new Error(`Streaming config not currently setup for table ${tableId}`)
    if (!table.tableStreamArn) throw new Error(`Stream has not been configured for table ${tableId}`)
    saveInSSMViaCloudFormation(scope, props, ssmTableStreamPath(tableId), table.tableStreamArn)
  }
}

function defineBucket(
  scope: Construct,
  props: AllStacksProps,
  id: string,
  ssmParamName: SsmParamName,
  options: { expirationDays?: number } = {}
) {
  const bucket = new Bucket(scope, id, {
    objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    autoDeleteObjects: props.storageResourceRemovalPolicy === RemovalPolicy.DESTROY,
    removalPolicy: props.storageResourceRemovalPolicy,
    eventBridgeEnabled: true,
    ...(options.expirationDays === undefined
      ? {}
      : {
          lifecycleRules: [
            {
              expiration: Duration.days(options.expirationDays)
            }
          ]
        })
  })

  saveInSSMViaCloudFormation(scope, props, ssmParamName, bucket.bucketName)
  return bucket
}

function defineGlueDatabase(scope: Construct, props: AllStacksProps) {
  const glueDatabaseName = props.appName.toLowerCase().replaceAll('-', '_')
  const glueDatabase = new CfnDatabase(scope, 'GlueDatabase', {
    catalogId: Aws.ACCOUNT_ID,
    databaseInput: {
      name: glueDatabaseName
    }
  })
  glueDatabase.applyRemovalPolicy(RemovalPolicy.DESTROY)
  saveInSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.GLUE_DATABASE_NAME, glueDatabaseName)

  return glueDatabaseName
}

function defineAthenaWorkgroup(scope: Construct, props: AllStacksProps, athenaOutputBucket: IBucket) {
  const athenaWorkgroupName = props.appName
  const athenaWorkgroup = new CfnWorkGroup(scope, 'AthenaWorkgroup', {
    name: `${athenaWorkgroupName}`,
    recursiveDeleteOption: props.storageResourceRemovalPolicy === RemovalPolicy.DESTROY,
    workGroupConfiguration: {
      resultConfiguration: {
        outputLocation: `s3://${athenaOutputBucket.bucketName}/`
      }
    }
  })
  saveInSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.ATHENA_WORKGROUP_NAME, athenaWorkgroupName)
  return { athenaWorkgroup, athenaWorkgroupName }
}
