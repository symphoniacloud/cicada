import { tracer } from '../util/tracing'
import {
  AthenaClient,
  GetQueryExecutionCommand,
  GetQueryExecutionOutput,
  StartQueryExecutionCommand,
  StartQueryExecutionInput
} from '@aws-sdk/client-athena'
import { StartQueryExecutionOutput } from '@aws-sdk/client-athena/dist-types/models/models_0'

export interface AthenaWrapper {
  startQuery(
    queryString: string,
    options: Partial<StartQueryExecutionInput>
  ): Promise<StartQueryExecutionOutput>

  getQuery(executionId: string): Promise<GetQueryExecutionOutput>
}

export function realAthena(): AthenaWrapper {
  const athena = tracer.captureAWSv3Client(new AthenaClient())

  return {
    async startQuery(queryString: string, options: Partial<StartQueryExecutionInput>) {
      return await athena.send(
        new StartQueryExecutionCommand({
          QueryString: queryString,
          ...options
        })
      )
    },

    async getQuery(executionId: string) {
      return await athena.send(
        new GetQueryExecutionCommand({
          QueryExecutionId: executionId
        })
      )
    }
  }
}
