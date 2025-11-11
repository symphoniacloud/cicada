import { getFromLocalEnvOrUndefined } from '../../multipleContexts/environmentVariables.js'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { RemovalPolicy } from 'aws-cdk-lib'
import { EnvironmentSettings } from '../config/environmentSettings.js'

type EnvironmentType = 'prod' | 'nonprod'

export function calculateEnvironmentSettingsWithEnvironmentVariables(
  env: NodeJS.ProcessEnv = process.env
): EnvironmentSettings {
  const environmentType = calculateEnvironmentType(getFromLocalEnvOrUndefined('ENVIRONMENT_TYPE', env))
  const isProd = environmentType === 'prod'

  return {
    web: {
      parentDomainName: getFromLocalEnvOrUndefined('PARENT_DOMAIN_NAME', env),
      certificateArn: getFromLocalEnvOrUndefined('WEB_CERTIFICATE_ARN', env),
      certificateArnCloudformationExport: getFromLocalEnvOrUndefined(
        'WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT',
        env
      )
    },
    logFullEvents: !isProd,
    logLevel: isProd ? 'INFO' : 'DEBUG',
    logRetention: isProd ? RetentionDays.ONE_MONTH : RetentionDays.THREE_DAYS,
    parametersMaxAgeSeconds: isProd ? 300 : 5,
    storageResourceRemovalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    deployDetailedMonitoring: true // TODO - make this configurable
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
