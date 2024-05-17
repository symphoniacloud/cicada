import { EnvironmentSettings } from './environmentSettings'
import { StackProps } from 'aws-cdk-lib'

export type WithEnvironment = Required<Pick<StackProps, 'env'>>

export interface AllStacksProps extends WithEnvironment, Omit<StackProps, 'env'>, EnvironmentSettings {
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
