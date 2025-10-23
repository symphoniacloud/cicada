import * as z from 'zod'
import { GitHubAccountIdSchema, GitHubRepoIdSchema, GitHubWorkflowIdSchema } from './GitHubIdTypes.js'

// TODO - readonly here and elsewhere

// TODO - move this and remove from UserSettings.ts
export const UserSettingSchema = z.literal(['visible', 'notify'])

export const PostUserSettingsParametersSchema = z.object({
  accountId: GitHubAccountIdSchema,
  repoId: GitHubRepoIdSchema.optional(),
  workflowId: GitHubWorkflowIdSchema.optional(),
  setting: UserSettingSchema,
  // Converts input string to a boolean during parsing
  enabled: z.stringbool({ truthy: ['true'], falsy: ['false'] })
})

export type PostUserSettingsParameters = z.infer<typeof PostUserSettingsParametersSchema>
