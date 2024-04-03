import { assert, expect, test } from 'vitest'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { ajvInstance, structuredValidate, validateAndThrow } from '../../../../src/app/schema/ajv'
import { isSuccess } from '../../../../src/app/util/structuredResult'

interface MyData {
  foo: number
  bar?: string
}

const testSchema: JTDSchemaType<MyData> = {
  properties: {
    foo: { type: 'int32' }
  },
  optionalProperties: {
    bar: { type: 'string' }
  }
}

test('structured-validate', () => {
  const validate = ajvInstance.compile(testSchema)
  const structuredSuccessResult = structuredValidate(validate, { foo: 3, bar: 'hello' })
  if (!isSuccess(structuredSuccessResult)) {
    assert.fail('Test failed - never found run events')
  }
  expect(structuredSuccessResult.result.foo).toEqual(3)
  expect(structuredSuccessResult.result.bar).toEqual('hello')

  const structuredFailureResult = structuredValidate(validate, { invalidData: 'here' })
  expect(isSuccess(structuredFailureResult)).toBeFalsy()

  const validateAndThrowSuccessResult = validateAndThrow(validate, { foo: 3, bar: 'hello' })
  expect(validateAndThrowSuccessResult.foo).toEqual(3)
  expect(validateAndThrowSuccessResult.bar).toEqual('hello')

  expect(() => validateAndThrow(validate, { invalidData: 'here' })).toThrowError()
})
