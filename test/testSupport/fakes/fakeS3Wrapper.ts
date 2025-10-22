import { S3Client } from '@aws-sdk/client-s3'
import { NodeJsRuntimeStreamingBlobPayloadOutputTypes } from '@smithy/types'
import { S3Wrapper } from '../../../src/app/outboundInterfaces/s3Wrapper.js'
import { arrayStubResponse } from './fakeSupport.js'

export class FakeS3Wrapper implements S3Wrapper {
  public getObjectsAsString = arrayStubResponse<{ bucket: string; key: string }, string>()

  async getObjectAsString(bucket: string, key: string) {
    return this.getObjectsAsString.getResponseOrThrow({ bucket, key })
  }

  s3client(): S3Client {
    throw new Error('Not valid for tests')
  }

  getObject(): Promise<NodeJsRuntimeStreamingBlobPayloadOutputTypes> {
    throw new Error('Method not implemented.')
  }
}
