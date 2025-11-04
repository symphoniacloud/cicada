import { expect, test } from 'vitest'
import { parseAddPublicAccountBody } from '../../../../../src/app/web/pages/adminAddPublicAccountPage.js'

// Note: URL encoding/decoding and null handling are tested in zodUtil.test.ts
// These tests focus on the business logic: validating accountName is present and non-empty

test('Success: returns accountName from valid form body', () => {
  const result = parseAddPublicAccountBody('accountName=testaccount')

  if (!result.isSuccessResult) {
    throw new Error('Should have been a valid result')
  }

  expect(result.result).toEqual({
    accountName: 'testaccount'
  })
})

test('Failure: rejects empty accountName', () => {
  const result = parseAddPublicAccountBody('accountName=')

  if (result.isSuccessResult) {
    throw new Error('Should have failed with empty accountName')
  }

  // Zod error should mention the field name
  expect(result.reason).toContain('accountName')
})

test('Failure: rejects missing accountName field', () => {
  const result = parseAddPublicAccountBody('otherField=value')

  if (result.isSuccessResult) {
    throw new Error('Should have failed with missing accountName')
  }

  // Zod error should mention the field name and undefined
  expect(result.reason).toContain('accountName')
  expect(result.reason).toContain('undefined')
})
