import { FakeDynamoDBInterface } from './fakeDynamoDBInterface.js'
import { FakeDynamoDBInterfaceGetStubber } from './fakeDynamoDBInterfaceGetStubber.js'
import { FakeDynamoDBInterfaceQueryAllPagesStubber } from './fakeDynamoDBInterfaceQueryAllPagesStubber.js'
import { FakeDynamoDBInterfaceQueryOnePageStubber } from './fakeDynamoDBInterfaceQueryOnePageStubber.js'

export type MetaDataProvider = (tableName: string) => {
  pk: string
  sk: string
  indexName: (indexId?: string) => string
  indexPk: (indexId?: string) => string
  indexSk: (indexId?: string) => string
}

export class FakeDynamoDBInterfaceStubber {
  public dynamoDB: FakeDynamoDBInterface
  public metaDataProvider: MetaDataProvider
  public stubGet: FakeDynamoDBInterfaceGetStubber
  public queryAllPages: FakeDynamoDBInterfaceQueryAllPagesStubber
  public queryOnePage: FakeDynamoDBInterfaceQueryOnePageStubber

  // TODO - this needs remaining scope to be added
  constructor(dynamoDB: FakeDynamoDBInterface, metaDataProvider: MetaDataProvider) {
    this.dynamoDB = dynamoDB
    this.metaDataProvider = metaDataProvider
    this.stubGet = new FakeDynamoDBInterfaceGetStubber(this)
    this.queryAllPages = new FakeDynamoDBInterfaceQueryAllPagesStubber(this)
    this.queryOnePage = new FakeDynamoDBInterfaceQueryOnePageStubber(this)
  }

  pk(tableName: string) {
    return this.metaDataProvider(tableName).pk
  }

  sk(tableName: string) {
    return this.metaDataProvider(tableName).sk
  }

  indexName(tableName: string, indexId?: string) {
    return this.metaDataProvider(tableName).indexName(indexId)
  }

  indexPk(tableName: string, indexId?: string) {
    return this.metaDataProvider(tableName).indexPk(indexId)
  }

  indexSk(tableName: string, indexId?: string) {
    return this.metaDataProvider(tableName).indexSk(indexId)
  }
}
