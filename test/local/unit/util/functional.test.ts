import { expect, test } from 'vitest'
import { identity } from '../../../../src/app/util/functional'

test('identity', () => {
  expect(identity(undefined)).toBeUndefined()
  expect(identity(null)).toBeNull()
  expect(identity(1)).toEqual(1)
  expect(identity({ a: 1 })).toEqual({ a: 1 })
})
