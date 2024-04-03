import { throwFunction } from './errors'

// Only used from development / deployment environment
export const LOCAL_ENV_VARS = [
  'APP_NAME',
  'ENVIRONMENT_TYPE',
  'GITHUB_APP_ID',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_PRIVATE_KEY',
  'CONFIG_ALLOWED_INSTALLATION_ACCOUNT_NAME',
  'WEB_PARENT_DOMAIN_NAME',
  'WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT',
  'WEB_PUSH_VAPID_PUBLIC_KEY',
  'WEB_PUSH_VAPID_PRIVATE_KEY',
  'WEB_PUSH_SUBJECT'
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
