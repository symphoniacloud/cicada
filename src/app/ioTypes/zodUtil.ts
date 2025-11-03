import { z } from 'zod'

export const JSONFromStringSchema = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ctx.addIssue({ code: 'custom', message: 'Invalid JSON string' })
    return z.NEVER
  }
})
