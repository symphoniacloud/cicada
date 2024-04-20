import { readFromSSMViaSDKInCDK } from '../support/ssm'
import { SSM_PARAM_NAMES } from '../../multipleContexts/ssmParams'
import { randomBytes } from 'node:crypto'
import { throwFunction } from '../../multipleContexts/errors'
import { AllStacksProps } from '../config/allStacksProps'
import { calculateEnvironmentSettingsWithEnvironmentVariables } from './environmentSettingsLoader'
import { generateVAPIDKeys } from 'web-push'

export async function createAllStacksProps(): Promise<AllStacksProps> {
  const account = process.env.CDK_DEFAULT_ACCOUNT ?? throwFunction('CDK_DEFAULT_ACCOUNT env var not set')()
  const appName = process.env.APP_NAME ?? throwFunction('APP_NAME env var not set')()

  return {
    env: {
      account,
      region: process.env.CDK_DEFAULT_REGION ?? throwFunction('CDK_DEFAULT_REGION env var not set')()
    },
    appName,
    randomizedValues: {
      githubWebhookURLCode: await readOrGenerateGithubWebhookURLCode(appName),
      githubCallbackState: await readOrGenerateGithubCallbackState(appName)
    },
    webPushConfig: await readOrGenerateWebPushConfig(appName),
    ...calculateEnvironmentSettingsWithEnvironmentVariables()
  }
}

// We have to look this up before deployment because API Gateway CDK Resource / CloudFormation Resource
// doesn't seem to be able to take parameters in resource names . Ideally would be a custom resource
// This is saved as a CloudFormation parameter in githubInteraction.ts
async function readOrGenerateGithubWebhookURLCode(appName: string) {
  const existingParam = await readFromSSMViaSDKInCDK({ appName }, SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE)
  if (existingParam) {
    return existingParam
  }

  console.log(
    '**!!** GENERATING NEW GITHUB_WEBHOOK_URL_CODE - THIS SHOULD ONLY OCCUR FOR NEW DEPLOYMENTS **!!**'
  )
  return randomBytes(32).toString('base64url')
}

// We only want to generate this value one time, otherwise it will require resetting every time
// and that slows down deployment. Consider a better option longer term
async function readOrGenerateGithubCallbackState(appName: string) {
  const existingParam = await readFromSSMViaSDKInCDK({ appName }, SSM_PARAM_NAMES.GITHUB_CALLBACK_STATE)
  if (existingParam) {
    return existingParam
  }

  return randomBytes(64).toString('base64url')
}

// We only want to generate these values on first deployment
// TOeventually - consider a better way of doing this
async function readOrGenerateWebPushConfig(appName: string) {
  const existingPublicKey = await readFromSSMViaSDKInCDK(
    { appName },
    SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY
  )
  const existingPrivateKey = await readFromSSMViaSDKInCDK(
    { appName },
    SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY
  )
  const existingSubject = await readFromSSMViaSDKInCDK({ appName }, SSM_PARAM_NAMES.WEB_PUSH_SUBJECT)

  if (existingPublicKey && !existingPrivateKey) {
    throw new Error(
      `Web Push Public key exists in SSM, but not private key - ABORTED. You should probably delete ${SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY} and all web push subscriptions, then try again  `
    )
  }

  if (existingPrivateKey && !existingPublicKey) {
    throw new Error(
      `Web Push Private key exists in SSM, but not private key - ABORTED. You should probably delete ${SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY} and all web push subscriptions, then try again  `
    )
  }

  // TOEventually - use public host, if it exists, as default subject
  const subject = existingSubject ?? 'https://github.com/symphoniacloud/cicada'

  if (existingPublicKey && existingPrivateKey) {
    return {
      publicKey: existingPublicKey,
      privateKey: existingPrivateKey,
      subject
    }
  }

  console.log('**!!** GENERATING WEB PUSH KEYS - THIS SHOULD ONLY OCCUR FOR NEW DEPLOYMENTS **!!**')
  const { publicKey, privateKey } = generateVAPIDKeys()
  return {
    publicKey,
    privateKey,
    subject
  }
}
