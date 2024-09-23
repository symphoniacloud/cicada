// See comment at WebPushEventBridgeDetailTypes if adding more types here
export const EVENTBRIDGE_DETAIL_TYPES = {
  GITHUB_NEW_PUSH: 'GithubNewPush',
  GITHUB_NEW_WORKFLOW_RUN_EVENT: 'GithubNewWorkflowRunEvent',
  WEB_PUSH_TEST: 'WebPushTest',
  INSTALLATION_UPDATED: 'InstallationUpdated',
  PUBLIC_ACCOUNT_UPDATED: 'PublicAccountUpdated',
  GITHUB_REPO_ACTIVITY_TABLE_UPDATED: 'GithubRepoActivityTableUpdated'
} as const

export type EventBridgeDetailType = (typeof EVENTBRIDGE_DETAIL_TYPES)[keyof typeof EVENTBRIDGE_DETAIL_TYPES]

export function isEventBridgeDetailType(x: unknown): x is EventBridgeDetailType {
  return typeof x === 'string' && Object.values(EVENTBRIDGE_DETAIL_TYPES).includes(x as EventBridgeDetailType)
}
