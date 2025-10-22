import {
  DeleteParameterCommand,
  GetParameterCommand,
  PutParameterCommand,
  SSMClient
} from '@aws-sdk/client-ssm'
import { createFullParameterName, SsmParamName } from '../../../src/multipleContexts/ssmParams.js'
import { throwFunction } from '../../../src/multipleContexts/errors.js'

// *** Only use these functions in tests
// *** For Lambda function code, use Powertools Parameters
// *** For CDK see cdk/support/ssm.ts

const ssmClient = new SSMClient()

export async function readFromSSMInTests(appName: string, key: SsmParamName): Promise<string> {
  const fullParameterName = createFullParameterName({ appName }, key)
  const returnVal = await ssmClient.send(
    new GetParameterCommand({
      Name: fullParameterName,
      WithDecryption: true
    })
  )
  return returnVal.Parameter?.Value ?? throwFunction(`${fullParameterName} not found`)()
}

export async function writeToSSMInTests(
  withAppName: { appName: string },
  key: SsmParamName,
  value: string | undefined
) {
  await ssmClient.send(
    new PutParameterCommand({
      Name: createFullParameterName(withAppName, key),
      Value: value,
      Type: 'String',
      Overwrite: true
    })
  )
}

export async function deleteFromSSMInTests(withAppName: { appName: string }, key: SsmParamName) {
  await ssmClient.send(
    new DeleteParameterCommand({
      Name: createFullParameterName(withAppName, key)
    })
  )
}
