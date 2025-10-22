import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { tracer } from '../util/tracing.js'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export function createDocumentClient(): DynamoDBDocumentClient {
  return tracer.captureAWSv3Client(DynamoDBDocumentClient.from(new DynamoDBClient({})))
}
