import { z } from 'zod'
import { GitHubUserIdSchema } from './GitHubSchemas.js'
import { parse } from 'node:querystring'
import { failedWith, failedWithResult, Result, successWith } from '../util/structuredResult.js'
import { logger } from '../util/logging.js'

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

// Overload: with failureResult
export function safeParseWithSchema<TSchema extends z.ZodType, TFailure>(
  schema: TSchema,
  data: unknown,
  failureResult: TFailure,
  options?: { logFailures?: boolean; logDetail?: string }
): Result<z.output<TSchema>, TFailure>

// Overload: without failureResult
export function safeParseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
  failureResult?: undefined,
  options?: { logFailures?: boolean; logDetail?: string }
): Result<z.output<TSchema>>

// Implementation
export function safeParseWithSchema<TSchema extends z.ZodType, TFailure>(
  schema: TSchema,
  data: unknown,
  failureResult?: TFailure,
  options: { logFailures?: boolean; logDetail?: string } = { logFailures: true }
): Result<z.output<TSchema>, TFailure> | Result<z.output<TSchema>> {
  const parseResult = schema.safeParse(data)
  if (parseResult.success) {
    return successWith(parseResult.data)
  }

  if (options.logFailures || options.logDetail) {
    logger.warn(`Request parsing failed${options.logDetail ? ` in ${options.logDetail}` : ''}`, {
      parseResult
    })
  }

  return failureResult !== undefined
    ? failedWithResult('Parsing failed', failureResult)
    : failedWith(parseResult.error.message)
}
