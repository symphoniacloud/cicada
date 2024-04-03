import { S3Wrapper } from '../../../src/app/outboundInterfaces/s3Wrapper'
import { arrayStubResponse } from './fakeSupport'

export class FakeS3Wrapper implements S3Wrapper {
  public getObjectsAsString = arrayStubResponse<{ bucket: string; key: string }, string>()

  async getObjectAsString(bucket: string, key: string) {
    return this.getObjectsAsString.getResponseOrThrow({ bucket, key })
  }
}
