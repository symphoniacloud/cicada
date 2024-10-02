export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type Mandatory<T, K extends keyof T> = Pick<Required<T>, K> & Omit<T, K>

export function isNumber(x: unknown): x is number {
  return typeof x === 'number'
}

export function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export function isStringOrUndefined(x: unknown): x is string {
  return x === undefined || typeof x === 'string'
}

export function isNotNullObject(x: unknown): x is NonNullable<object> {
  return x !== null && typeof x === 'object'
}

export function stringIsUnpaddedNotEmptyNonNegativeInteger(x: string): x is `${number}` {
  if (x.length === 0 || x.trim().length !== x.length) return false
  const xAsNumber = Number(x)
  return Number.isInteger(xAsNumber) && xAsNumber >= 0
}

export function isIntegerStringWithPrefix<TPrefix extends string>(
  prefix: TPrefix,
  x: unknown
): x is `${TPrefix}${number}` {
  return (
    isString(x) && x.startsWith(prefix) && stringIsUnpaddedNotEmptyNonNegativeInteger(x.slice(prefix.length))
  )
}
