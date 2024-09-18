// Basic configuration and listing of all the DynamoDB tables used by the app
// Used by CDK for deployment and application code for configuration

// If adding here, also add to SsmTableNameParamName type

export const CICADA_TABLE_IDS = [
  'github-installations',
  'github-user-tokens',
  'github-users',
  'github-account-memberships',
  'github-repositories',
  'github-repo-activity',
  'github-latest-workflow-runs',
  'github-latest-pushes-per-ref',
  'github-public-accounts',
  'user-settings',
  'web-push-subscriptions'
] as const
export type CicadaTableId = (typeof CICADA_TABLE_IDS)[number]

interface CicadaTableConfig {
  readonly hasSortKey: boolean
  readonly hasGSI1: boolean
  readonly stream: boolean
  readonly useTtl: boolean
}

const allFalseConfig: CicadaTableConfig = {
  hasGSI1: false,
  hasSortKey: false,
  stream: false,
  useTtl: false
}

export const tableConfigurations: Record<CicadaTableId, CicadaTableConfig> = {
  'github-installations': allFalseConfig,
  'github-user-tokens': { ...allFalseConfig, useTtl: true },
  'github-users': allFalseConfig,
  'github-account-memberships': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: true
  },
  'github-repositories': {
    ...allFalseConfig,
    hasSortKey: true
  },
  'github-repo-activity': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: true,
    stream: true
  },
  'github-latest-workflow-runs': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: true
  },
  'github-latest-pushes-per-ref': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: true
  },
  'github-public-accounts': {
    ...allFalseConfig,
    hasSortKey: true
  },
  'user-settings': allFalseConfig,
  'web-push-subscriptions': {
    ...allFalseConfig,
    hasSortKey: true
  }
}
