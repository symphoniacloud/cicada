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

export function secondsTimestampInFutureDays(clock: Clock, days: number): number {
  return dateToTimestampSeconds(dateTimeAddDays(clock.now(), days))
}

export function dateToTimestampSeconds(date: Date) {
  return Math.floor(date.valueOf() / 1000)
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
