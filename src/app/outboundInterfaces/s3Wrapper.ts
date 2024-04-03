import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { tracer } from '../util/tracing'
import { throwFunction } from '../../multipleContexts/errors'

export interface S3Wrapper {
  getObjectAsString(bucket: string, key: string): Promise<string>
}

export function realS3(): S3Wrapper {
  const s3 = tracer.captureAWSv3Client(new S3Client({}))

  return {
    async getObjectAsString(bucket: string, key: string): Promise<string> {
      const body =
        (
          await s3.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: key
            })
          )
        ).Body ?? throwFunction(`No body for s3://${bucket}/${key}`)()

      return await body.transformToString()
    }
  }
}
