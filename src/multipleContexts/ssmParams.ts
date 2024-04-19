import { CicadaTableId } from './dynamoDBTables'

export const SSM_PARAM_NAMES = {
  CONFIG_ALLOWED_INSTALLATION_ACCOUNT_NAME: 'cicada/allowed-github-installation-account-name',
  GITHUB_APP_ID: 'github/app-id',
  GITHUB_CLIENT_ID: 'github/client-id',
  GITHUB_PRIVATE_KEY: 'github/private-key',
  GITHUB_CLIENT_SECRET: 'github/client-secret',
  GITHUB_WEBHOOK_SECRET: 'github/webhook-secret',
  WEB_PUSH_VAPID_PUBLIC_KEY: 'web-push/vapid-public-key',
  WEB_PUSH_VAPID_PRIVATE_KEY: 'web-push/vapid-private-key',
  WEB_PUSH_SUBJECT: 'web-push/subject',
  // Generated during deployment process. Used by Github Auth Lambda Function and Setup
  GITHUB_CALLBACK_STATE: 'cicada/github-callback-state',
  // Generated during deployment process. Could be replaced by a custom resource
  // Used for random part of Github Webhook URL - only used in API Gateway Configuration
  GITHUB_WEBHOOK_URL_CODE: 'cicada/github-webhook-url-code',
  // Resource locations
  EVENTS_BUCKET_NAME: 'resources/bucket/events',
  WEB_HOSTNAME: 'resources/hostname/web',
  // Table names are also stored in SSM, but they aren't defined explicitly here, instead
  // they are defined via using ssmTableNamePath() and the CicadaTableId type
  // Used, and set, only during remote tests
  TEST_COOKIE_SECRET: 'testing/cookie-token'
} as const

// Typescript Question - 1-1 with CICADA_TABLE_IDS - is it possible to remove duplication?
type SsmTableNameParamName =
  | 'resources/table/github-installations'
  | 'resources/table/github-users'
  | 'resources/table/github-repositories'
  | 'resources/table/github-account-memberships'
  | 'resources/table/github-repo-activity'
  | 'resources/table/github-latest-workflow-runs'
  | 'resources/table/github-latest-pushes-per-ref'
  | 'resources/table/web-push-subscriptions'

export type SsmParamName = (typeof SSM_PARAM_NAMES)[keyof typeof SSM_PARAM_NAMES] | SsmTableNameParamName

export function ssmTableNamePath(id: CicadaTableId): SsmParamName {
  return `resources/table/${id}`
}

export function createFullParameterName({ appName }: { appName: string }, key: string) {
  return `/${appName}/${key}`
}
