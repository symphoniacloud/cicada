import {
  RawGithubInstallationSchema,
  RawGithubRepoSchema,
  RawGithubUserSchema,
  RawGithubWorkflowSchema
} from './RawGitHubSchemas.js'
import { z } from 'zod'

export type RawGithubInstallation = z.infer<typeof RawGithubInstallationSchema>
export type RawGithubUser = z.infer<typeof RawGithubUserSchema>
export type RawGithubRepo = z.infer<typeof RawGithubRepoSchema>
export type RawGithubWorkflow = z.infer<typeof RawGithubWorkflowSchema>
