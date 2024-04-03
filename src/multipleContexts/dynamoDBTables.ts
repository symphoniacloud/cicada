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
  hasSortKey: boolean
  hasGSI1: boolean
}

export const tableConfigurations: Record<CicadaTableId, CicadaTableConfig> = {
  'github-installations': {
    hasSortKey: false,
    hasGSI1: false
  },
  'github-users': {
    hasSortKey: false,
    hasGSI1: false
  },
  'github-account-memberships': {
    hasSortKey: true,
    hasGSI1: true
  },
  'github-repositories': {
    hasSortKey: true,
    hasGSI1: false
  },
  'github-repo-activity': {
    hasSortKey: true,
    hasGSI1: true
  },
  'github-latest-workflow-runs': {
    hasSortKey: true,
    hasGSI1: true
  },
  'github-latest-pushes-per-ref': {
    hasSortKey: true,
    hasGSI1: true
  },
  'web-push-subscriptions': {
    hasSortKey: true,
    hasGSI1: false
  }
}
