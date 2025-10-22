import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { FakeDynamoDBInterfaceStubber } from './fakeDynamoDBInterfaceStubber.js'

export class FakeDynamoDBInterfaceGetStubber {
  private stubber: FakeDynamoDBInterfaceStubber

  constructor(stubber: FakeDynamoDBInterfaceStubber) {
    this.stubber = stubber
  }

  public stub(
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    item: Record<string, NativeAttributeValue>
  ) {
    this.stubber.dynamoDB.stubGets.addResponse(
      {
        TableName: tableName,
        Key: key
      },
      {
        $metadata: {},
        Item: item
      }
    )
  }

  public byPk(tableName: string, key: string, item: Record<string, NativeAttributeValue>) {
    this.stub(tableName, { [this.stubber.pk(tableName)]: key }, item)
  }

  public byPkAndSk(tableName: string, pk: string, sk: string, item: Record<string, NativeAttributeValue>) {
    this.stub(tableName, { [this.stubber.pk(tableName)]: pk, [this.stubber.sk(tableName)]: sk }, item)
  }
}
