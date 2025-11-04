export type Mandatory<T, K extends keyof T> = Pick<Required<T>, K> & Omit<T, K>

export function isNotNullObject(x: unknown): x is NonNullable<object> {
  return x !== null && typeof x === 'object'
}
