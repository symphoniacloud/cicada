import { z } from 'zod'

export const EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH = 'GithubNewPush'
export const EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT = 'GithubNewWorkflowRunEvent'
export const EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST = 'WebPushTest'
export const EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_UPDATED = 'InstallationUpdated'
export const EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED = 'PublicAccountUpdated'
export const EVENTBRIDGE_DETAIL_TYPE_GITHUB_REPO_ACTIVITY_TABLE_UPDATED = 'GithubRepoActivityTableUpdated'

export const GithubNewPushDetailTypeSchema = z.literal(EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH)
export const GithubNewWorkflowRunEventDetailTypeSchema = z.literal(
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT
)
export const WebPushTestDetailTypeSchema = z.literal(EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST)
export const InstallationUpdatedDetailTypeSchema = z.literal(EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_UPDATED)
export const PublicAccountUpdatedDetailTypeSchema = z.literal(EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED)
export const GithubRepoActivityTableUpdatedDetailTypeSchema = z.literal(
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_REPO_ACTIVITY_TABLE_UPDATED
)

export const EventBridgeDetailTypeSchema = z.union([
  GithubNewPushDetailTypeSchema,
  GithubNewWorkflowRunEventDetailTypeSchema,
  WebPushTestDetailTypeSchema,
  InstallationUpdatedDetailTypeSchema,
  PublicAccountUpdatedDetailTypeSchema,
  GithubRepoActivityTableUpdatedDetailTypeSchema
])

export const WebpushEventBridgeDetailTypeSchema = z.union([
  GithubNewPushDetailTypeSchema,
  GithubNewWorkflowRunEventDetailTypeSchema,
  WebPushTestDetailTypeSchema
])

export type EventBridgeDetailType = z.infer<typeof EventBridgeDetailTypeSchema>
export type WebPushEventBridgeDetailType = z.infer<typeof WebpushEventBridgeDetailTypeSchema>
