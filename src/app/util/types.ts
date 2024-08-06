export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type Mandatory<T, K extends keyof T> = Pick<Required<T>, K> & Omit<T, K>

export function isNumber(x: unknown): x is number {
  return typeof x === 'number'
}

export function isString(x: unknown): x is number {
  return typeof x === 'string'
}

export function isNotNullObject(x: unknown): x is NonNullable<object> {
  return x !== null && typeof x === 'object'
}
