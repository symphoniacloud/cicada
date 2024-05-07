import { Clock } from '../../../src/app/util/dateAndTime'

export const defaultFakeNowIso = '2024-02-02T19:00:00.000Z'

export class FakeClock implements Clock {
  public fakeNowIso: string

  constructor(fakeNowIso = defaultFakeNowIso) {
    this.fakeNowIso = fakeNowIso
  }

  now(): Date {
    return new Date(Date.parse(this.fakeNowIso))
  }
}

export const defaultFakeClock = new FakeClock()
