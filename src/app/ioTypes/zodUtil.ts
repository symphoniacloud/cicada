import { z } from 'zod'
import { GitHubUserIdSchema } from './GitHubSchemas.js'
import { parse } from 'node:querystring'
import { failedWith, Result, successWith } from '../util/structuredResult.js'

export const JSONFromStringSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON string' })
    return z.NEVER
  }
})

export const URLEncodedFormSchema = z
  .string()
  .nullish()
  .transform((str) => parse(str ?? ''))

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

export function safeParseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown
): Result<z.output<TSchema>> {
  const parseResult = schema.safeParse(data)

  if (!parseResult.success) {
    return failedWith(parseResult.error.message)
  }

  return successWith(parseResult.data)
}
