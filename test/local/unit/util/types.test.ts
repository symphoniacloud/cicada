import { expect, test } from 'vitest'
import {
  isIntegerStringWithPrefix,
  stringIsUnpaddedNotEmptyNonNegativeInteger
} from '../../../../src/app/util/types.js'

test('stringIsUnpaddedNotEmptyPositiveNumeric', () => {
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('123')).toBeTruthy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('0')).toBeTruthy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('0123')).toBeTruthy()

  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('')).toBeFalsy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('-123')).toBeFalsy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('123asd')).toBeFalsy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger(' 123')).toBeFalsy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('123 ')).toBeFalsy()
  expect(stringIsUnpaddedNotEmptyNonNegativeInteger('123.45')).toBeFalsy()
})

test('isNumericStringWithPrefix', () => {
  expect(isIntegerStringWithPrefix('foo-', 'foo-123')).toBeTruthy()
  expect(isIntegerStringWithPrefix('foo-', 'foo-0')).toBeTruthy()

  expect(isIntegerStringWithPrefix('foo-', undefined)).toBeFalsy()
  expect(isIntegerStringWithPrefix('foo-', '123')).toBeFalsy()
  expect(isIntegerStringWithPrefix('foo-', 'foo- 123')).toBeFalsy()
  expect(isIntegerStringWithPrefix('foo-', 'bar-123')).toBeFalsy()
  expect(isIntegerStringWithPrefix('foo-', 'bar-123.45')).toBeFalsy()
  expect(isIntegerStringWithPrefix('foo-', 'bar--123')).toBeFalsy()
})
