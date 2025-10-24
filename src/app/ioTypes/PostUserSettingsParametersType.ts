import * as z from 'zod'
import { GitHubAccountIdSchema, GitHubRepoIdSchema, GitHubWorkflowIdSchema } from './GitHubSchemas.js'

// TODO - Should these be here?
export const UserSettingSchema = z.literal(['visible', 'notify'])

export type UserSetting = z.infer<typeof UserSettingSchema>

export const PostUserSettingsParametersSchema = z.object({
  accountId: GitHubAccountIdSchema,
  repoId: GitHubRepoIdSchema.optional(),
  workflowId: GitHubWorkflowIdSchema.optional(),
  setting: UserSettingSchema,
  // Converts input string to a boolean during parsing
  enabled: z.stringbool({ truthy: ['true'], falsy: ['false'] })
})

export type PostUserSettingsParameters = z.infer<typeof PostUserSettingsParametersSchema>
