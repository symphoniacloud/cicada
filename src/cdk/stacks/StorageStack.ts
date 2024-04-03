import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { saveInSSMViaCloudFormation } from '../support/ssm'
import { AllStacksProps } from '../config/allStacksProps'
import { BlockPublicAccess, Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { SSM_PARAM_NAMES, ssmTableNamePath } from '../../multipleContexts/ssmParams'
import { CICADA_TABLE_IDS, CicadaTableId, tableConfigurations } from '../../multipleContexts/dynamoDBTables'

export class StorageStack extends Stack {
  constructor(scope: Construct, id: string, props: AllStacksProps) {
    super(scope, id, props)

    for (const tableId of CICADA_TABLE_IDS) {
      defineTable(this, props, tableId)
    }

    const eventsBucket = new Bucket(this, 'EventsBucket', {
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: props.storageResourceRemovalPolicy === RemovalPolicy.DESTROY,
      removalPolicy: props.storageResourceRemovalPolicy,
      eventBridgeEnabled: true,
      lifecycleRules: [
        {
          expiration: Duration.days(14)
        }
      ]
    })

    saveInSSMViaCloudFormation(this, props, SSM_PARAM_NAMES.EVENTS_BUCKET_NAME, eventsBucket.bucketName)
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
