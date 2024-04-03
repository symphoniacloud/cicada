export type Success<T> = { successResult: true; result: T }
export type Failure = { successResult: false; reason: string }
export type Result<T> = Success<T> | Failure

export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.successResult
}

export function isFailed<T>(result: Result<T>): result is Failure {
  return !result.successResult
}

export const emptySuccess: Success<unknown> = {
  successResult: true,
  result: undefined
}

export function failedWith(reason: string): Failure {
  return { successResult: false, reason }
}
