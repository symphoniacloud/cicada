import { expect, test } from 'vitest'
import {
  arrayDifferenceDeep,
  excludeKeys,
  mergeOrderedLists,
  selectKeys
} from '../../../../src/app/util/collections'

test('selectKeys', () => {
  expect(selectKeys({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 })
})

test('excludeKeys', () => {
  expect(excludeKeys({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 })
})

test('merge ordered lists', () => {
  expect(
    mergeOrderedLists(
      [
        { a: 2, b: 'mm' },
        { a: 4, b: 'nn' }
      ],
      [
        { a: 1, b: 'oo' },
        {
          a: 3,
          b: 'pp'
        }
      ],
      (x, y) => x.a < y.a
    )
  ).toEqual([
    { a: 1, b: 'oo' },
    { a: 2, b: 'mm' },
    { a: 3, b: 'pp' },
    { a: 4, b: 'nn' }
  ])

  expect(mergeOrderedLists([{ a: 1, b: 'oo' }], [], () => true)).toEqual([{ a: 1, b: 'oo' }])
  expect(mergeOrderedLists([], [{ a: 1, b: 'oo' }], () => true)).toEqual([{ a: 1, b: 'oo' }])
  expect(mergeOrderedLists([], [], () => true)).toEqual([])
})

test('array difference', () => {
  expect(arrayDifferenceDeep([1, 2, 3, 4], [2, 4])).toEqual([1, 3])
  expect(arrayDifferenceDeep([1, 2], [1, 2])).toEqual([])
  expect(arrayDifferenceDeep([1, 2], [3, 4])).toEqual([1, 2])
  expect(arrayDifferenceDeep([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }], [{ x: 2 }, { x: 4 }])).toEqual([
    { x: 1 },
    { x: 3 }
  ])
})
