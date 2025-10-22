import { BatchWriteCommand, DynamoDBDocumentClient, paginateScan } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment.js'
import { selectKeys } from '@symphoniacloud/dynamodb-entity-store'

export async function deleteAllItemsInTable(tableName: string, keyFields: string[]) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}))

  for await (const page of paginateScan({ client, pageSize: 25 }, { TableName: tableName })) {
    process.stdout.write('.')
    const items = page.Items
    if (items) {
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: items.map((item) => ({
              DeleteRequest: {
                Key: selectKeys(item, keyFields)
              }
            }))
          }
        })
      )
    }
  }
}

// noinspection JSUnusedGlobalSymbols
export async function deleteAllItemsInCicadaTable() {
  const appState = await appStateForTests()
  const tableName = (await appState.config.tableNames())['github-repo-activity']
  await deleteAllItemsInTable(tableName, ['PK', 'SK'])
}
