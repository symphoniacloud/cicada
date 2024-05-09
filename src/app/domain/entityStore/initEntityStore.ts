import {
  AllEntitiesStore,
  createStore,
  documentClientBackedInterface,
  DynamoDBInterface,
  EntityStoreLogger,
  TableConfig
} from '@symphoniacloud/dynamodb-entity-store'
import { createDocumentClient } from '../../outboundInterfaces/dynamoDb'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_INSTALLATION,
  GITHUB_LATEST_PUSH_PER_REF,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  GITHUB_PUSH,
  GITHUB_REPOSITORY,
  GITHUB_USER,
  GITHUB_WORKFLOW_RUN,
  GITHUB_WORKFLOW_RUN_EVENT,
  WEB_PUSH_SUBSCRIPTION
} from './entityTypes'
import { Clock } from '../../util/dateAndTime'
import { TableNames } from '../../environment/config'
import { CicadaTableId, tableConfigurations } from '../../../multipleContexts/dynamoDBTables'

// I separate out this function and setupEntityStore, so that in local-tests
// I can fake out interface to DynamoDB while still using EntityStore logic
export function setupEntityStoreBackedByRealDynamoDB(
  tableNames: TableNames,
  clock: Clock,
  logger: EntityStoreLogger
) {
  return setupEntityStore(
    tableNames,
    clock,
    logger,
    documentClientBackedInterface(logger, createDocumentClient())
  )
}

export function setupEntityStore(
  tableNames: TableNames,
  clock: Clock,
  logger: EntityStoreLogger,
  dynamoDB: DynamoDBInterface
): AllEntitiesStore {
  return createStore(
    {
      // Most entity types get their own table - just a few use shared tables
      // This isn't "single table design", however all entities use the same PK / SK
      // field names, so tables could likely be merged in future if necessary
      entityTables: [
        {
          entityTypes: [GITHUB_INSTALLATION],
          ...entityStoreConfigFor(tableNames, 'github-installations')
        },
        {
          entityTypes: [GITHUB_USER],
          ...entityStoreConfigFor(tableNames, 'github-users')
        },
        {
          entityTypes: [GITHUB_ACCOUNT_MEMBERSHIP],
          ...entityStoreConfigFor(tableNames, 'github-account-memberships')
        },
        {
          entityTypes: [GITHUB_REPOSITORY],
          ...entityStoreConfigFor(tableNames, 'github-repositories')
        },
        {
          entityTypes: [GITHUB_WORKFLOW_RUN_EVENT, GITHUB_WORKFLOW_RUN, GITHUB_PUSH],
          ...entityStoreConfigFor(tableNames, 'github-repo-activity')
        },
        {
          entityTypes: [GITHUB_LATEST_WORKFLOW_RUN_EVENT],
          ...entityStoreConfigFor(tableNames, 'github-latest-workflow-runs')
        },
        {
          entityTypes: [GITHUB_LATEST_PUSH_PER_REF],
          ...entityStoreConfigFor(tableNames, 'github-latest-pushes-per-ref')
        },
        {
          entityTypes: [WEB_PUSH_SUBSCRIPTION],
          ...entityStoreConfigFor(tableNames, 'web-push-subscriptions')
        }
      ]
    },
    {
      logger,
      clock,
      dynamoDB
    }
  )
}

function entityStoreConfigFor(tableNames: TableNames, tableId: CicadaTableId): TableConfig {
  const config = tableConfigurations[tableId]
  return {
    tableName: tableNames[tableId],
    metaAttributeNames: {
      pk: 'PK',
      entityType: '_et',
      lastUpdated: '_lastUpdated',
      ...(config.hasSortKey ? { sk: 'SK' } : {}),
      ...(config.hasGSI1
        ? {
            gsisById: {
              gsi1: {
                pk: 'GSI1PK',
                sk: 'GSI1SK'
              }
            }
          }
        : {})
    },
    ...(config.hasGSI1
      ? {
          gsiNames: {
            gsi1: 'GSI1'
          }
        }
      : {})
  }
}
