import UrlPattern from 'url-pattern'
import { ajvInstance, structuredValidate } from './ajv'
import { JTDSchemaType, ValidateFunction } from 'ajv/dist/jtd'
import { logger } from '../util/logging'
import { Result } from '../util/structuredResult'

// TOEventually - there's overlap here with the internal router, e.g.
// each request actually calls urlPattern.match twice. Eventually think about making this
// more efficient

export type WithPath = { path: string }
export type QueryStringParameters = { [name: string]: string | undefined } | null

export function validatingPathParser<T>(
  pathPattern: string,
  schema: JTDSchemaType<T>
): ({ path }: WithPath) => Result<T> {
  const urlPattern = new UrlPattern(pathPattern)
  const validate: ValidateFunction<T> = ajvInstance.compile(schema)
  return ({ path }: WithPath) => {
    const pathParams = urlPattern.match(path)
    logger.debug('Parsed path params', { pathParams })
    return structuredValidate(validate, pathParams)
  }
}

export function validatingQueryStringParser<T>(
  schema: JTDSchemaType<T>
): (params: QueryStringParameters) => Result<T> {
  const validate: ValidateFunction<T> = ajvInstance.compile(schema)
  return (params: QueryStringParameters) => {
    return structuredValidate(validate, params)
  }
}
