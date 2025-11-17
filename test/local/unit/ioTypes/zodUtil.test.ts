import { describe, expect, test } from 'vitest'
import { safeParseWithSchema, URLEncodedFormSchema } from '../../../../src/app/ioTypes/zodUtil.js'
import { z } from 'zod'
import { withSuppressedWarningLogs } from '../../../testSupport/logging.js'

test('URLEncodedFormSchema: parses simple key-value pair', () => {
  const result = URLEncodedFormSchema.parse('key=value')
  expect(result).toEqual({ key: 'value' })
})

test('URLEncodedFormSchema: parses multiple key-value pairs', () => {
  const result = URLEncodedFormSchema.parse('name=John&age=30&city=NYC')
  expect(result).toEqual({ name: 'John', age: '30', city: 'NYC' })
})

test('URLEncodedFormSchema: handles URL-encoded values', () => {
  const result = URLEncodedFormSchema.parse('message=hello%20world&symbol=%26')
  expect(result).toEqual({ message: 'hello world', symbol: '&' })
})

test('URLEncodedFormSchema: handles empty string', () => {
  const result = URLEncodedFormSchema.parse('')
  expect(result).toEqual({})
})

test('URLEncodedFormSchema: handles null', () => {
  const result = URLEncodedFormSchema.parse(null)
  expect(result).toEqual({})
})

test('URLEncodedFormSchema: handles undefined', () => {
  const result = URLEncodedFormSchema.parse(undefined)
  expect(result).toEqual({})
})

test('URLEncodedFormSchema: handles empty value', () => {
  const result = URLEncodedFormSchema.parse('key=')
  expect(result).toEqual({ key: '' })
})

test('URLEncodedFormSchema: handles multiple values for same key', () => {
  const result = URLEncodedFormSchema.parse('color=red&color=blue')
  // querystring.parse returns array for repeated keys
  expect(result).toEqual({ color: ['red', 'blue'] })
})

describe('safeParseWithSchema', () => {
  test('Success: returns parsed data when validation passes', () => {
    const schema = z.object({ name: z.string(), age: z.number() })
    const data = { name: 'Alice', age: 30 }

    const result = safeParseWithSchema(schema, data)

    if (!result.isSuccessResult) {
      throw new Error('Should have been a successful parse')
    }

    expect(result.result).toEqual({ name: 'Alice', age: 30 })
  })

  test('Success: applies transformations from schema', () => {
    const schema = z.string().transform((s) => s.toUpperCase())
    const data = 'hello'

    const result = safeParseWithSchema(schema, data)

    if (!result.isSuccessResult) {
      throw new Error('Should have been a successful parse')
    }

    expect(result.result).toBe('HELLO')
  })

  test('Success: coerces types when schema allows', () => {
    const schema = z.object({ count: z.coerce.number() })
    const data = { count: '42' }

    const result = safeParseWithSchema(schema, data)

    if (!result.isSuccessResult) {
      throw new Error('Should have been a successful parse')
    }

    expect(result.result).toEqual({ count: 42 })
  })

  test('Failure: returns Zod error message when validation fails', () => {
    withSuppressedWarningLogs(() => {
      const schema = z.object({ name: z.string(), age: z.number() })
      const data = { name: 'Alice', age: 'not a number' }

      const result = safeParseWithSchema(schema, data)

      if (result.isSuccessResult) {
        throw new Error('Should have failed validation')
      }

      // Zod error message should mention the field and type issue
      expect(result.reason).toContain('age')
      expect(result.reason).toContain('number')
    })
  })

  test('Failure: returns Zod error message when required field missing', () => {
    withSuppressedWarningLogs(() => {
      const schema = z.object({ name: z.string(), age: z.number() })
      const data = { name: 'Alice' }

      const result = safeParseWithSchema(schema, data)

      if (result.isSuccessResult) {
        throw new Error('Should have failed validation')
      }

      // Zod error message should mention the missing field and undefined
      expect(result.reason).toContain('age')
      expect(result.reason).toContain('undefined')
    })
  })

  test('Failure: returns Zod error message when type is completely wrong', () => {
    withSuppressedWarningLogs(() => {
      const schema = z.object({ name: z.string() })
      const data = 'not an object'

      const result = safeParseWithSchema(schema, data)

      if (result.isSuccessResult) {
        throw new Error('Should have failed validation')
      }

      // Zod error message should mention object type
      expect(result.reason).toContain('object')
    })
  })

  test('Success: works with complex nested schemas', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email()
      }),
      tags: z.array(z.string())
    })
    const data = {
      user: { name: 'Bob', email: 'bob@example.com' },
      tags: ['admin', 'user']
    }

    const result = safeParseWithSchema(schema, data)

    if (!result.isSuccessResult) {
      throw new Error('Should have been a successful parse')
    }

    expect(result.result).toEqual(data)
  })

  test('Success: works with URLEncodedFormSchema pipe', () => {
    const schema = URLEncodedFormSchema.pipe(z.object({ accountName: z.string().min(1) }))
    const data = 'accountName=testaccount'

    const result = safeParseWithSchema(schema, data)

    if (!result.isSuccessResult) {
      throw new Error('Should have been a successful parse')
    }

    expect(result.result).toEqual({ accountName: 'testaccount' })
  })

  test('Failure: URLEncodedFormSchema pipe returns Zod error for empty required field', () => {
    withSuppressedWarningLogs(() => {
      const schema = URLEncodedFormSchema.pipe(z.object({ accountName: z.string().min(1) }))
      const data = 'accountName='

      const result = safeParseWithSchema(schema, data)

      if (result.isSuccessResult) {
        throw new Error('Should have failed validation')
      }

      // Zod error message should mention the field and constraint
      expect(result.reason).toContain('accountName')
    })
  })
})
