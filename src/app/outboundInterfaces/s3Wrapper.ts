import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { tracer } from '../util/tracing.js'
import { throwFunction } from '../../multipleContexts/errors.js'
import { NodeJsRuntimeStreamingBlobPayloadOutputTypes } from '@smithy/types'

export interface S3Wrapper {
  getObjectAsString(bucket: string, key: string): Promise<string>

  getObject(bucket: string, key: string): Promise<NodeJsRuntimeStreamingBlobPayloadOutputTypes>

  s3client(): S3Client
}

export function realS3(): S3Wrapper {
  const s3 = tracer.captureAWSv3Client(new S3Client({}))

  return {
    async getObjectAsString(bucket: string, key: string): Promise<string> {
      return await (await getS3Object(s3, bucket, key)).transformToString()
    },
    async getObject(bucket: string, key: string): Promise<NodeJsRuntimeStreamingBlobPayloadOutputTypes> {
      return await getS3Object(s3, bucket, key)
    },

    s3client(): S3Client {
      return s3
    }
  }
}

export async function getS3Object(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<NodeJsRuntimeStreamingBlobPayloadOutputTypes> {
  return ((
    await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )
  ).Body ??
    throwFunction(`No body for s3://${bucket}/${key}`)()) as NodeJsRuntimeStreamingBlobPayloadOutputTypes
}
