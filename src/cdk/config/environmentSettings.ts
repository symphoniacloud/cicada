import { LogLevel } from '@aws-lambda-powertools/logger/types'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { RemovalPolicy } from 'aws-cdk-lib'

export interface EnvironmentSettings {
  readonly web: {
    readonly parentDomainName?: string
    readonly certificateArn?: string
    readonly certificateArnCloudformationExport?: string
  }
  readonly logLevel: LogLevel
  readonly logFullEvents: boolean
  readonly logRetention: RetentionDays
  readonly parametersMaxAgeSeconds: number
  readonly storageResourceRemovalPolicy: RemovalPolicy
  readonly deployDetailedMonitoring: boolean
}
