import { expect, test } from 'vitest'
import {
  dateTimeAddDays,
  dateTimeAddHours,
  dateTimeAddMinutes,
  dateTimeAddSeconds,
  displayDateTime,
  timestampToIso
} from '../../../../src/app/util/dateAndTime'
import { Clock } from '@symphoniacloud/dynamodb-entity-store'

function makeFakeClock(atTime = '2023-11-01T12:00:00'): Clock {
  return {
    now(): Date {
      return new Date(atTime)
    }
  }
}

test('dateTimeAdd', () => {
  expect(dateTimeAddDays(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-04T01:23:45'))
  expect(dateTimeAddHours(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T04:23:45'))
  expect(dateTimeAddMinutes(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T01:26:45'))
  expect(dateTimeAddSeconds(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T01:23:48'))
})

test('toFriendlyText', () => {
  const fakeClock = makeFakeClock()

  expect(displayDateTime(fakeClock, '2023-11-01T11:00:00Z')).toEqual('11:00:00')
  expect(displayDateTime(fakeClock, '2023-10-31T16:00:00Z')).toEqual('2023-10-31')
  expect(displayDateTime(fakeClock, '2023-10-29T16:00:00Z')).toEqual('2023-10-29')
  expect(displayDateTime(fakeClock, '2023-10-20T16:00:00Z')).toEqual('2023-10-20')
  expect(displayDateTime(fakeClock, '2023-03-20T16:00:00Z')).toEqual('2023-03-20')

  // Future
  expect(displayDateTime(fakeClock, '2023-11-02T11:00:00')).toEqual('2023-11-02T11:00:00')
})

test('timestampToIso', () => {
  expect(timestampToIso('2024-03-06T21:26:18.000Z')).toEqual('2024-03-06T21:26:18.000Z')
  expect(timestampToIso('2024-03-06T21:26:18Z')).toEqual('2024-03-06T21:26:18.000Z')
  expect(timestampToIso('2024-03-06T23:26:18-05:00')).toEqual('2024-03-07T04:26:18.000Z')
})
