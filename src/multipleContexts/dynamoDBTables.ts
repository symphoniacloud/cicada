// Basic configuration and listing of all the DynamoDB tables used by the app
// Used by CDK for deployment and application code for configuration

// If adding here, also add to SsmTableNameParamName type

export const CICADA_TABLE_IDS = [
  'github-installations',
  'github-users',
  'github-account-memberships',
  'github-repositories',
  'github-repo-activity',
  'github-latest-workflow-runs',
  'github-latest-pushes-per-ref',
  'web-push-subscriptions'
] as const
export type CicadaTableId = (typeof CICADA_TABLE_IDS)[number]

interface CicadaTableConfig {
  readonly hasSortKey: boolean
  readonly hasGSI1: boolean
  readonly stream: boolean
}

const allFalseConfig: CicadaTableConfig = {
  hasGSI1: false,
  hasSortKey: false,
  stream: false
}

export const tableConfigurations: Record<CicadaTableId, CicadaTableConfig> = {
  'github-installations': allFalseConfig,
  'github-users': allFalseConfig,
  'github-account-memberships': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: true
  },
  'github-repositories': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: false
  },
  'github-repo-activity': {
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
  'web-push-subscriptions': {
    ...allFalseConfig,
    hasSortKey: true,
    hasGSI1: false
  }
}
