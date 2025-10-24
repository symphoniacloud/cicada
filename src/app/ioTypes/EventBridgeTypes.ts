import * as z from 'zod'
import { GithubPushSchema, GitHubWorkflowRunEventSchema } from './GitHubSchemas.js'

export const CicadaEventBridgeGitHubPushSchema = z.object({
  data: GithubPushSchema
})

export const CicadaEventBridgeGitHubWorkflowRunEventSchema = z.object({
  data: GitHubWorkflowRunEventSchema
})
