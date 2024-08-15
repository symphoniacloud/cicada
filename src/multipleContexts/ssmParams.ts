import { CicadaTableId } from './dynamoDBTables'

export const SSM_PARAM_NAMES = {
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
  REPORTING_INGESTION_BUCKET_NAME: 'resources/bucket/reporting-ingestion',
  REPORTING_BUCKET_NAME: 'resources/bucket/reporting',
  ATHENA_OUTPUT_BUCKET_NAME: 'resources/bucket/athena-output',
  WEB_HOSTNAME: 'resources/hostname/web',
  GLUE_DATABASE_NAME: 'resources/glue/database',
  ATHENA_WORKGROUP_NAME: 'resources/athena/workgroup',
  // Table names are also stored in SSM, but they aren't defined explicitly here, instead
  // they are defined via using ssmTableNamePath() and the CicadaTableId type
  // Used, and set, only during remote tests
  TEST_COOKIE_SECRET: 'testing/cookie-token'
} as const

// Typescript Question - 1-1 with CICADA_TABLE_IDS - is it possible to remove duplication?
type SsmTableNameParamName =
  | 'resources/table/github-installations'
  | 'resources/table/github-user-tokens'
  | 'resources/table/github-users'
  | 'resources/table/github-repositories'
  | 'resources/table/github-account-memberships'
  | 'resources/table/github-repo-activity'
  | 'resources/table/github-latest-workflow-runs'
  | 'resources/table/github-latest-pushes-per-ref'
  | 'resources/table/user-settings'
  | 'resources/table/web-push-subscriptions'

type SsmTableStreamParamName = 'resources/tableStreamArn/github-repo-activity'

export type SsmParamName =
  | (typeof SSM_PARAM_NAMES)[keyof typeof SSM_PARAM_NAMES]
  | SsmTableNameParamName
  | SsmTableStreamParamName

export function ssmTableNamePath(id: CicadaTableId): SsmParamName {
  return `resources/table/${id}`
}

// For now, only table with a stream
export function ssmTableStreamPath(id: CicadaTableId): SsmParamName {
  if (id !== 'github-repo-activity') throw new Error('Only currently implemented for github-repo-activity')
  return `resources/tableStreamArn/${id}`
}

export function createFullParameterName({ appName }: { appName: string }, key: string) {
  return `/${appName}/${key}`
}
