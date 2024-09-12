import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { FakeDynamoDBInterfaceStubber } from './fakeDynamoDBInterfaceStubber'

export class FakeDynamoDBInterfaceQueryAllPagesStubber {
  private stubber: FakeDynamoDBInterfaceStubber

  constructor(stubber: FakeDynamoDBInterfaceStubber) {
    this.stubber = stubber
  }

  public stub(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, NativeAttributeValue>,
    items: Record<string, NativeAttributeValue>[],
    entityType: string,
    options: {
      ScanIndexForward?: boolean
      IndexName?: string
      ExpressionAttributeNames?: Record<string, string>
    } = {}
  ) {
    this.stubber.dynamoDB.stubAllPagesQueries.addResponse(
      {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ...options
      },
      [
        {
          $metadata: {},
          Items: items.map((item) => ({ ...item, _et: entityType }))
        }
      ]
    )
  }

  public ofTableByPk(
    tableName: string,
    key: NativeAttributeValue,
    items: Record<string, NativeAttributeValue>[],
    entityType: string,
    scanIndexForward?: boolean
  ) {
    this.stub(tableName, `${this.stubber.pk(tableName)} = :pk`, { ':pk': key }, items, entityType, {
      ...(scanIndexForward === undefined ? {} : { ScanIndexForward: scanIndexForward })
    })
  }

  public ofTableByPkAndSk(
    tableName: string,
    skExpression: string,
    pk: NativeAttributeValue,
    skExpressionAttributeValues: Record<string, NativeAttributeValue>,
    items: Record<string, NativeAttributeValue>[],
    entityType: string,
    scanIndexForward?: boolean
  ) {
    this.stub(
      tableName,
      `${this.stubber.pk(tableName)} = :pk and ${skExpression}`,
      { ':pk': pk, ...skExpressionAttributeValues },
      items,
      entityType,
      {
        ExpressionAttributeNames: { '#sk': 'SK' },
        ...(scanIndexForward === undefined ? {} : { ScanIndexForward: scanIndexForward })
      }
    )
  }

  public ofIndexPyPk(
    tableName: string,
    key: NativeAttributeValue,
    items: Record<string, NativeAttributeValue>[],
    entityType: string,
    scanIndexForward?: boolean
  ) {
    this.stub(tableName, `${this.stubber.indexPk(tableName)} = :pk`, { ':pk': key }, items, entityType, {
      IndexName: this.stubber.indexName(tableName),
      ...(scanIndexForward === undefined ? {} : { ScanIndexForward: scanIndexForward })
    })
  }

  public ofIndexPyPkAndSk(
    tableName: string,
    skExpression: string,
    pk: NativeAttributeValue,
    skExpressionAttributeValues: Record<string, NativeAttributeValue>,
    items: Record<string, NativeAttributeValue>[],
    entityType: string,
    scanIndexForward?: boolean
  ) {
    this.stub(
      tableName,
      `${this.stubber.indexPk(tableName)} = :pk and ${skExpression}`,
      { ':pk': pk, ...skExpressionAttributeValues },
      items,
      entityType,
      {
        IndexName: this.stubber.indexName(tableName),
        ExpressionAttributeNames: { '#sk': `${this.stubber.indexSk(tableName)}` },
        ...(scanIndexForward === undefined ? {} : { ScanIndexForward: scanIndexForward })
      }
    )
  }

  //
  // public byPkAndSk(tableName: string, pk: string, sk: string, item: Record<string, NativeAttributeValue>) {
  //   this.stub(tableName, { [this.stubber.pk(tableName)]: pk, [this.stubber.sk(tableName)]: sk }, item)
  // }
}
