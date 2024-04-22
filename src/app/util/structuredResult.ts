export type Success<T> = { successResult: true; result: T }
export type Failure<T = unknown> = { successResult: false; reason: string; failureResult: T }
export type Result<TSuccess, TFailure = unknown> = Success<TSuccess> | Failure<TFailure>

export function isSuccess<TSuccess, TFailure>(
  result: Result<TSuccess, TFailure>
): result is Success<TSuccess> {
  return result.successResult
}

export function isFailure<TSuccess, TFailure>(
  result: Result<TSuccess, TFailure>
): result is Failure<TFailure> {
  return !result.successResult
}

export function successWith<T>(result: T): Success<T> {
  return { successResult: true, result }
}

export const emptySuccess = successWith(undefined)

export function failedWith(reason: string): Failure<unknown> {
  return failedWithResult(reason, undefined)
}

export function failedWithResult<T>(reason: string, failureResult: T): Failure<T> {
  return { successResult: false, reason, failureResult }
}
