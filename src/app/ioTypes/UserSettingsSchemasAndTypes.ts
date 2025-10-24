import * as z from 'zod'
import {
  GitHubAccountIdSchema,
  GitHubRepoIdSchema,
  GitHubUserKeySchema,
  GitHubWorkflowIdSchema
} from './GitHubSchemas.js'

// These aren't readonly on purpose, for now
export const PersistedVisibleAndNotifyConfigurableSchema = z.object({
  visible: z.boolean().optional(),
  notify: z.boolean().optional()
})

export const PersistedGithubWorkflowSettingsSchema = PersistedVisibleAndNotifyConfigurableSchema

export const PersistedGithubRepoSettingsSchema = z.object({
  ...PersistedVisibleAndNotifyConfigurableSchema.shape,
  workflows: z.record(GitHubWorkflowIdSchema, PersistedGithubWorkflowSettingsSchema)
})

export const PersistedGithubAccountSettingsSchema = z.object({
  ...PersistedVisibleAndNotifyConfigurableSchema.shape,
  repos: z.record(GitHubRepoIdSchema, PersistedGithubRepoSettingsSchema)
})

export const PersistedUserSettingsSchema = z.object({
  ...GitHubUserKeySchema.unwrap().shape,
  github: z.object({
    accounts: z.record(GitHubAccountIdSchema, PersistedGithubAccountSettingsSchema)
  })
})

export type PersistedVisibleAndNotifyConfigurable = z.infer<
  typeof PersistedVisibleAndNotifyConfigurableSchema
>

export type PersistedGithubAccountSettings = z.infer<typeof PersistedGithubAccountSettingsSchema>

export type PersistedGithubRepoSettings = z.infer<typeof PersistedGithubRepoSettingsSchema>

export type PersistedGithubWorkflowSettings = z.infer<typeof PersistedGithubWorkflowSettingsSchema>

export type PersistedUserSettings = z.infer<typeof PersistedUserSettingsSchema>
