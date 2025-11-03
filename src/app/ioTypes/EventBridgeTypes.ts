import * as z from 'zod'
import { GithubPushSchema, GitHubUserSummarySchema, GitHubWorkflowRunEventSchema } from './GitHubSchemas.js'
import { EventBridgeSchema } from '@aws-lambda-powertools/parser/schemas/eventbridge'
import {
  GithubNewPushDetailTypeSchema,
  GithubNewWorkflowRunEventDetailTypeSchema,
  WebPushTestDetailTypeSchema
} from '../../multipleContexts/eventBridgeSchemas.js'

// This exists since eventually would be nice to add metadata (see https://community.aws/posts/eventbridge-schema-registry-best-practices)
export function cicadaEventBridgeDetailSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema
  })
}

export const CicadaGitHubPushEventBridgeDetailSchema = cicadaEventBridgeDetailSchema(GithubPushSchema)

export const CicadaGitHubWorkflowRunEventEventBridgeDetailSchema = cicadaEventBridgeDetailSchema(
  GitHubWorkflowRunEventSchema
)

export const WebPushTestEventBridgeDetailSchema = cicadaEventBridgeDetailSchema(GitHubUserSummarySchema)

export const GithubNewPushEventBridgeEventSchema = z.object({
  ...EventBridgeSchema.shape,
  'detail-type': GithubNewPushDetailTypeSchema,
  detail: CicadaGitHubPushEventBridgeDetailSchema
})

export const GithubNewWorkflowEventBridgeEventSchema = z.object({
  ...EventBridgeSchema.shape,
  'detail-type': GithubNewWorkflowRunEventDetailTypeSchema,
  detail: CicadaGitHubWorkflowRunEventEventBridgeDetailSchema
})

export const WebPushTestEventBridgeEventSchema = z.object({
  ...EventBridgeSchema.shape,
  'detail-type': WebPushTestDetailTypeSchema,
  detail: WebPushTestEventBridgeDetailSchema
})

export const WebPushEventBridgeEventSchema = z.discriminatedUnion('detail-type', [
  GithubNewPushEventBridgeEventSchema,
  GithubNewWorkflowEventBridgeEventSchema,
  WebPushTestEventBridgeEventSchema
])

export type CicadaGitHubWorkflowRunEventDetail = z.infer<
  typeof CicadaGitHubWorkflowRunEventEventBridgeDetailSchema
>

export type CicadaGitHubPushEventBridgeDetail = z.infer<typeof CicadaGitHubPushEventBridgeDetailSchema>
export type CicadaGitHubWorkflowRunEventEventBridgeDetail = z.infer<
  typeof CicadaGitHubWorkflowRunEventEventBridgeDetailSchema
>
export type WebPushTestEventBridgeDetail = z.infer<typeof WebPushTestEventBridgeDetailSchema>
