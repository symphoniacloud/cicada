import { ajvInstance, structuredValidate } from './ajv.js'
import { JTDSchemaType, ValidateFunction } from 'ajv/dist/jtd.js'
import { Result } from '../util/structuredResult.js'

export type QueryStringParameters = { [name: string]: string | undefined } | null


export function validatingQueryStringParser<T>(
  schema: JTDSchemaType<T>
): (params: QueryStringParameters) => Result<T> {
  const validate: ValidateFunction<T> = ajvInstance.compile(schema)
  return (params: QueryStringParameters) => {
    return structuredValidate(validate, params)
  }
}
