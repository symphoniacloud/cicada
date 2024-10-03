import { expect, test } from 'vitest'
import {
  arrayDifferenceDeep,
  excludeKeys,
  mergeOrderedLists,
  objectMap,
  removeNullAndUndefined,
  selectKeys,
  sortBy
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

test('sortBy', () => {
  expect(sortBy([2, 1, 4, 3, 1], (x) => x)).toEqual([1, 1, 2, 3, 4])
  expect(sortBy([2, 1, 4, 3, 1], (x) => x, true)).toEqual([1, 1, 2, 3, 4])
  expect(sortBy([2, 1, 4, 3, 1], (x) => x, false)).toEqual([4, 3, 2, 1, 1])
  expect(
    sortBy(
      [
        { n: 0.3, x: 'a' },
        { n: 0.2, x: 'b' },
        { n: -0.1, x: 'c' }
      ],
      ({ n }) => n,
      true
    )
  ).toEqual([
    { n: -0.1, x: 'c' },
    { n: 0.2, x: 'b' },
    { n: 0.3, x: 'a' }
  ])
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

test('removeNullAndUndefined', () => {
  expect(removeNullAndUndefined([])).toEqual([])
  expect(removeNullAndUndefined([null, undefined])).toEqual([])
  expect(removeNullAndUndefined([1, null, undefined, 1])).toEqual([1, 1])
  expect(removeNullAndUndefined([null, 1, undefined, 1])).toEqual([1, 1])
})

test('objectMap', () => {
  const mapped = objectMap({ a: 1, b: 2, c: 3 }, (key: string, value: number) => [`foo${key}`, [value + 1]])
  expect(mapped).toEqual({ fooa: [2], foob: [3], fooc: [4] })
})
