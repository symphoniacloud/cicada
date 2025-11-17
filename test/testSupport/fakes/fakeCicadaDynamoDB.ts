import { FakeDynamoDBInterface } from '@symphoniacloud/dynamodb-entity-store-testutils'
import {
  CICADA_TABLE_IDS,
  CicadaTableId,
  tableConfigurations
} from '../../../src/multipleContexts/dynamoDBTables.js'
import { fakeTableNames } from './fakeCicadaConfig.js'

export class FakeCicadaDynamoDB extends FakeDynamoDBInterface {
  constructor() {
    super(fakeTableDefs())
  }
}

function fakeTableDefs() {
  return Object.fromEntries(CICADA_TABLE_IDS.map((id) => [fakeTableNames[id], fakeTableDefinition(id)]))
}

function fakeTableDefinition(id: CicadaTableId) {
  const config = tableConfigurations[id]
  return {
    pkName: 'PK',
    ...(config.hasSortKey ? { skName: 'SK' } : {}),
    ...(config.hasGSI1
      ? {
          gsis: {
            GSI1: {
              pkName: 'GSI1PK',
              skName: 'GSI1SK'
            }
          }
        }
      : {})
  }
}
