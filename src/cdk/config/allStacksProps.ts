import { throwFunction } from '../../multipleContexts/errors'
import { Environment, StackProps } from 'aws-cdk-lib'
import {
  calculateEnvironmentSettingsWithEnvironmentVariables,
  EnvironmentSettings
} from './environmentSettings'
import { createFullParameterName, SSM_PARAM_NAMES } from '../../multipleContexts/ssmParams'
import { randomBytes } from 'node:crypto'
import { readFromSSMViaSDKInCDK } from '../support/ssm'

export interface AllStacksProps extends StackProps, EnvironmentSettings {
  readonly env: Required<Environment>
  readonly appName: string
  readonly randomizedValues: {
    readonly githubWebhookURLCode: string
    readonly githubWebhookSecret: string
    readonly githubCallbackState: string
  }
}

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
      githubWebhookSecret: await readOrGenerateGithubWebhookSecret(appName),
      githubCallbackState: await readOrGenerateGithubCallbackState(appName)
    },
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

  const newCode = randomBytes(32).toString('base64url')
  if (inGithubActions()) {
    console.log(
      `*** DEPLOYING NEW GITHUB_WEBHOOK_URL_CODE IN SSM PARAM ${createFullParameterName(
        { appName },
        SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE
      )} . USE THIS IN YOUR GITHUB APP CONFIGURATION ***`
    )
  } else {
    console.log(
      `*** DEPLOYING NEW GITHUB_WEBHOOK_URL_CODE : ${newCode} . USE THIS IN YOUR GITHUB APP CONFIGURATION ***`
    )
  }

  return newCode
}

// We only want to generate this value one time
async function readOrGenerateGithubWebhookSecret(appName: string) {
  const existingParam = await readFromSSMViaSDKInCDK({ appName }, SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET)
  if (existingParam) {
    return existingParam
  }

  const newSecret = randomBytes(64).toString('base64url')
  if (inGithubActions()) {
    console.log(
      `*** DEPLOYING NEW GITHUB_WEBHOOK_SECRET IN SSM PARAM ${createFullParameterName(
        { appName },
        SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET
      )} . USE THIS IN YOUR GITHUB APP CONFIGURATION ***`
    )
  } else {
    console.log(
      `*** DEPLOYING NEW GITHUB_WEBHOOK_SECRET : ${newSecret} . USE THIS IN YOUR GITHUB APP CONFIGURATION ***`
    )
  }
  return newSecret
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

// Don't log generated secrets if running in GitHub Actions
function inGithubActions() {
  return process.env['CI'] === 'true'
}
