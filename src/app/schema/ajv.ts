import * as AjvJTDModule from 'ajv/dist/jtd.js'
import type { ValidateFunction } from 'ajv/dist/jtd.js'
import { logger } from '../util/logging.js'
import { failedWith, isSuccess, Result, successWith } from '../util/structuredResult.js'

// Still a few things to consider with how I use Ajv, e.g.
// * Use it in most of the places I have complex type guards
// * Think about using JTDDataType
// * What to do about various options and formats once I want to do things that are more complex
// * Interaction between internal router and parsing
// * Consider other options for schema management, e.g. instance cache, pre-built validators
//   (which would be driven, e.g., by startup time)
// * Is Ajv even the best solution, or would be better to use Zod, e.g.?

// Global ajv instance
// @ts-expect-error - CJS/ESM interop issue with ajv
export const ajvInstance = new AjvJTDModule.default()

export function structuredValidate<T>(validate: ValidateFunction<T>, data: unknown): Result<T> {
  return validate(data)
    ? successWith(data)
    : failedWith(
        (validate?.errors ?? [])
          .map((er: { message?: string }) => {
            logger.debug(`Validation error: ${JSON.stringify(er)}`)
            return er.message
          })
          .filter((x) => x !== undefined)
          .join()
      )
}

export function validateAndThrow<T>(validate: ValidateFunction<T>, data: unknown): T {
  const result = structuredValidate(validate, data)
  if (isSuccess(result)) return result.result
  throw new Error(`Validation Failed: ${result.reason}`)
}
