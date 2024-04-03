import { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { createFullParameterName, SsmParamName } from '../../multipleContexts/ssmParams'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'

export function saveInSSMViaCloudFormation(
  scope: Construct,
  withAppName: { appName: string },
  key: SsmParamName,
  value: string
) {
  new StringParameter(scope, `SSMParam${key}`, {
    parameterName: createFullParameterName(withAppName, key),
    stringValue: value
  })
}

export function readFromSSMViaCloudFormation(
  scope: Construct,
  withAppName: { appName: string },
  key: string
) {
  const parameterName = createFullParameterName(withAppName, key)
  const parameter = StringParameter.fromStringParameterAttributes(scope, `SSMParamValue${key}`, {
    parameterName: parameterName
  })
  if (!parameter) throw new Error(`Unable to locate SSM parameter ${parameterName}`)
  return parameter.stringValue
}

const ssmClient = new SSMClient()

// Only use this when SSM parameters need to be read locally, before CDK synthesis
// Typically we want to read them at CloudFormation deployment time, in which case
// we use readFromSSMViaCloudFormation()
export async function readFromSSMViaSDKInCDK(withAppName: { appName: string }, key: SsmParamName) {
  const fullParameterName = createFullParameterName(withAppName, key)
  try {
    const returnVal = await ssmClient.send(
      new GetParameterCommand({
        Name: fullParameterName,
        WithDecryption: true
      })
    )
    return returnVal.Parameter?.Value
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (e?.name === 'ParameterNotFound') {
      return undefined
    } else {
      throw e
    }
  }
}
