import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { saveInSSMViaCloudFormation } from '../support/ssm.js'
import { AllStacksProps } from '../config/allStacksProps.js'
import { BlockPublicAccess, Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { SSM_PARAM_NAMES, SsmParamName, ssmTableNamePath } from '../../multipleContexts/ssmParams.js'
import {
  CICADA_TABLE_IDS,
  CicadaTableId,
  tableConfigurations
} from '../../multipleContexts/dynamoDBTables.js'

export class StorageStack extends Stack {
  constructor(scope: Construct, id: string, props: AllStacksProps) {
    super(scope, id, props)

    for (const tableId of CICADA_TABLE_IDS) {
      defineTable(this, props, tableId)
    }

    defineBucket(this, props, 'EventsBucket', SSM_PARAM_NAMES.EVENTS_BUCKET_NAME, { expirationDays: 14 })
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
