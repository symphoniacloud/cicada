import { throwFunction } from './errors'

// Only used from development / deployment environment
export const LOCAL_ENV_VARS = [
  'APP_NAME',
  'ENVIRONMENT_TYPE',
  'PARENT_DOMAIN_NAME',
  'WEB_CERTIFICATE_ARN',
  'WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT'
] as const
export type LocalEnvVar = (typeof LOCAL_ENV_VARS)[keyof typeof LOCAL_ENV_VARS]

export function getFromLocalEnv(name: LocalEnvVar, env: NodeJS.ProcessEnv = process.env): string {
  return env[name as string] ?? throwFunction(`${name} not found in environment`)()
}

export function getFromLocalEnvOrUndefined(
  name: LocalEnvVar,
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  return env[name as string]
}
