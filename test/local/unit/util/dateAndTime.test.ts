import { expect, test } from 'vitest'
import {
  dateTimeAddDays,
  dateTimeAddHours,
  dateTimeAddMinutes,
  dateTimeAddSeconds,
  dateToTimestampSeconds,
  displayDateTime,
  isoDifferenceAsString,
  timestampSecondsIsInPast,
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

const fakeClock = makeFakeClock()

test('dateTimeAdd', () => {
  expect(dateTimeAddDays(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-04T01:23:45'))
  expect(dateTimeAddHours(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T04:23:45'))
  expect(dateTimeAddMinutes(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T01:26:45'))
  expect(dateTimeAddSeconds(new Date('2023-03-01T01:23:45'), 3)).toEqual(new Date('2023-03-01T01:23:48'))
})

test('toFriendlyText', () => {
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

test('isoDifferenceToString', () => {
  expect(isoDifferenceAsString('2023-09-01T11:00:00Z', '2023-11-01T12:00:00Z')).toEqual('61 days')
  expect(isoDifferenceAsString('2023-11-01T12:00:00Z', '2023-09-01T11:00:00Z')).toEqual('61 days')
  expect(isoDifferenceAsString('2023-10-30T11:00:00Z', '2023-11-01T12:30:00Z')).toEqual('2 days')
  expect(isoDifferenceAsString('2023-11-01T12:30:00Z', '2023-10-30T11:00:00Z')).toEqual('2 days')
  expect(isoDifferenceAsString('2023-10-31T11:00:00Z', '2023-11-01T12:30:00Z')).toEqual('1 day, 1:30:00')
  expect(isoDifferenceAsString('2023-11-01T12:30:00Z', '2023-10-31T11:00:00Z')).toEqual('1 day, 1:30:00')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T12:30:00Z')).toEqual('1:30:00')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:30:00Z')).toEqual('0:30:00')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:05:30Z')).toEqual('0:05:30')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:00:30Z')).toEqual('30 seconds')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:00:01.623Z')).toEqual('2 seconds')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:00:01.123Z')).toEqual('1 second')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:00:00.823Z')).toEqual('1 second')
  expect(isoDifferenceAsString('2023-11-01T11:00:00Z', '2023-11-01T11:00:00.323Z')).toEqual('--')
})

test('timestampSecondsIsInPast', () => {
  expect(
    timestampSecondsIsInPast(fakeClock, dateToTimestampSeconds(new Date('2023-11-01T11:00:00')))
  ).toBeTruthy()
  expect(
    timestampSecondsIsInPast(fakeClock, dateToTimestampSeconds(new Date('2023-11-01T13:00:00')))
  ).toBeFalsy()
})
