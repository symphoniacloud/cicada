import { z } from 'zod'
import { RawGithubInstallationSchema } from './RawGitHubSchemas.js'

export type RawGithubInstallation = z.infer<typeof RawGithubInstallationSchema>
