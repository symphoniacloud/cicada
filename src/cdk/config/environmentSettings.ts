import { LogLevel } from '@aws-lambda-powertools/logger/types'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { getFromLocalEnv, getFromLocalEnvOrUndefined } from '../../multipleContexts/environmentVariables'
import { RemovalPolicy } from 'aws-cdk-lib'

export interface EnvironmentSettings {
  readonly web: {
    readonly parentDomainName: string
    readonly certificateArnCloudformationExport: string
  }
  readonly logLevel: LogLevel
  readonly logFullEvents: boolean
  readonly logRetention: RetentionDays
  readonly parametersMaxAgeSeconds: number
  readonly storageResourceRemovalPolicy: RemovalPolicy
}

type EnvironmentType = 'prod' | 'nonprod'

export function calculateEnvironmentSettingsWithEnvironmentVariables(
  env: NodeJS.ProcessEnv = process.env
): EnvironmentSettings {
  const environmentType = calculateEnvironmentType(getFromLocalEnvOrUndefined('ENVIRONMENT_TYPE', env))
  const isProd = environmentType === 'prod'

  return {
    web: {
      parentDomainName: getFromLocalEnv('WEB_PARENT_DOMAIN_NAME', env),
      certificateArnCloudformationExport: getFromLocalEnv('WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT', env)
    },
    logFullEvents: !isProd,
    logLevel: isProd ? 'INFO' : 'DEBUG',
    logRetention: isProd ? RetentionDays.ONE_MONTH : RetentionDays.THREE_DAYS,
    parametersMaxAgeSeconds: isProd ? 300 : 5,
    storageResourceRemovalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
  }
}

function calculateEnvironmentType(envTypeEnvVar: string | undefined): EnvironmentType {
  if (envTypeEnvVar === undefined) {
    console.log('ENVIRONMENT_TYPE environment variable is not defined - assuming non-prod')
    return 'nonprod'
  }
  const lowerEnvVar = envTypeEnvVar.toLowerCase()
  if (lowerEnvVar === 'prod' || lowerEnvVar === 'nonprod') {
    return lowerEnvVar
  } else
    throw new Error(
      `ENVIRONMENT_TYPE environment variable ${envTypeEnvVar} is invalid - must be prod or nonprod - aborting`
    )
}
