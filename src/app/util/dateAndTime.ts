export interface Clock {
  now(): Date
}

export const realClock: Clock = {
  now() {
    return new Date()
  }
}

export function timestampToIso(timestamp: string) {
  return new Date(timestamp).toISOString()
}

export function dateTimeAddMilliseconds(date: Date, millis: number) {
  return new Date(date.valueOf() + millis)
}

export function dateTimeAddSeconds(date: Date, seconds: number) {
  return dateTimeAddMilliseconds(date, seconds * 1000)
}

export function dateTimeAddMinutes(date: Date, minutes: number) {
  return dateTimeAddSeconds(date, minutes * 60)
}

export function dateTimeAddHours(date: Date, hours: number) {
  return dateTimeAddMinutes(date, hours * 60)
}

export function dateTimeAddDays(date: Date, days: number) {
  return dateTimeAddHours(date, days * 24)
}

export function secondsTimestampInFutureHours(clock: Clock, hours: number): number {
  return dateToTimestampSeconds(dateTimeAddHours(clock.now(), hours))
}

export function dateToTimestampSeconds(date: Date) {
  return Math.floor(date.valueOf() / 1000)
}

const ONE_SECOND_IN_MS = 1000
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60
const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60
const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 24

export function isoDifferenceAsString(isoOne: string, isoTwo: string): string {
  return durationAsStringFromMs(isoDifferenceMs(isoOne, isoTwo))
}

export function isoDifferenceMs(isoOne: string, isoTwo: string) {
  return timestampDifferenceMs(Date.parse(isoOne), Date.parse(isoTwo))
}

export function timestampSecondsIsInPast(clock: Clock, timestampSeconds: number) {
  return dateToTimestampSeconds(clock.now()) > timestampSeconds
}

export function timestampDifferenceMs(tsOne: number, tsTwo: number) {
  return Math.abs(tsOne.valueOf() - tsTwo.valueOf())
}

export function durationAsStringFromMs(duration: number): string {
  const { days, hours, minutes, seconds } = durationInParts(duration)

  if (days > 1) return `${days} days`
  if (days === 1) return `1 day, ${hours}:${padTwo(minutes)}:${padTwo(seconds)}`
  if (hours > 0) return `${hours}:${padTwo(minutes)}:${padTwo(seconds)}`
  if (minutes > 0) return `0:${padTwo(minutes)}:${padTwo(seconds)}`
  if (seconds > 0) return `${seconds} second${seconds === 1 ? '' : 's'}`
  return '--'
}

export function durationInParts(duration: number) {
  const days = Math.floor(duration / ONE_DAY_IN_MS)
  const hoursRemaining = duration - days * ONE_DAY_IN_MS
  const hours = Math.floor(hoursRemaining / ONE_HOUR_IN_MS)
  const minutesRemaining = hoursRemaining - hours * ONE_HOUR_IN_MS
  const minutes = Math.floor(minutesRemaining / ONE_MINUTE_IN_MS)
  const seconds = Math.round((minutesRemaining - minutes * ONE_MINUTE_IN_MS) / ONE_SECOND_IN_MS)

  return { days, hours, minutes, seconds }
}

function padTwo(input: number) {
  return input < 10 ? `0${input}` : `${input}`
}
// Do something nicer for this
export function displayDateTime(clock: Clock, sourceIso: string) {
  const now = clock.now()
  const source = new Date(sourceIso)
  if (now < source) return sourceIso

  const nowIso = now.toISOString()
  const nowDate = nowIso.substring(0, 10)
  const sourceDate = sourceIso.substring(0, 10)

  return nowDate === sourceDate ? sourceIso.substring(11, 19) : sourceDate
}
