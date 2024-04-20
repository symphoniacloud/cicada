import { Environment, StackProps } from 'aws-cdk-lib'
import { EnvironmentSettings } from './environmentSettings'

export interface AllStacksProps extends StackProps, EnvironmentSettings {
  readonly env: Required<Environment>
  readonly appName: string
  readonly randomizedValues: {
    readonly githubWebhookURLCode: string
    readonly githubCallbackState: string
  }
  readonly webPushConfig: {
    readonly publicKey: string
    readonly privateKey: string
    readonly subject: string
  }
}
