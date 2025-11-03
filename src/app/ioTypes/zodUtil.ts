import { z } from 'zod'
import { GitHubUserIdSchema } from './GitHubSchemas.js'

export const JSONFromStringSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON string' })
    return z.NEVER
  }
})

export const APIEventSchema = z.object({
  requestContext: z.object({
    authorizer: z.object({
      // TODO - can probably move these to where they are written
      userId: GitHubUserIdSchema,
      username: z.string()
    })
  })
})

export type APIEvent = z.infer<typeof APIEventSchema>
