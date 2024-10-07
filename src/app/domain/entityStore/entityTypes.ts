export const GITHUB_WORKFLOW_RUN_EVENT = 'githubWorkflowRunEvent'
export const GITHUB_WORKFLOW_RUN = 'githubWorkflowRun'
export const GITHUB_LATEST_WORKFLOW_RUN_EVENT = 'githubLatestWorkflowRunEvent'
export const GITHUB_INSTALLATION = 'githubInstallation'
export const GITHUB_LATEST_PUSH_PER_REF = 'githubLatestPushPerRef'
export const GITHUB_PUSH = 'githubPush'
export const GITHUB_ACCOUNT_MEMBERSHIP = 'githubAccountMembership'
export const GITHUB_PUBLIC_ACCOUNT = 'githubPublicAccount'
export const GITHUB_REPOSITORY = 'githubRepository'
export const GITHUB_WORKFLOW = 'githubWorkflow'
export const GITHUB_USER = 'githubUser'
export const GITHUB_USER_TOKEN = 'githubUserToken'
export const USER_SETTINGS = 'userSettings'
export const WEB_PUSH_SUBSCRIPTION = 'webPushSubscription'

export const ALL_ENTITY_TYPES = [
  GITHUB_WORKFLOW_RUN_EVENT,
  GITHUB_WORKFLOW_RUN,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  GITHUB_INSTALLATION,
  GITHUB_LATEST_PUSH_PER_REF,
  GITHUB_PUSH,
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_PUBLIC_ACCOUNT,
  GITHUB_REPOSITORY,
  GITHUB_WORKFLOW,
  GITHUB_USER,
  GITHUB_USER_TOKEN,
  USER_SETTINGS,
  WEB_PUSH_SUBSCRIPTION
] as const

export type EntityType = (typeof ALL_ENTITY_TYPES)[number]
