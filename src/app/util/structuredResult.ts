export type Success<T> = { isSuccessResult: true; result: T }
export type Failure<T = unknown> = { isSuccessResult: false; reason: string; failureResult: T }
export type Result<TSuccess, TFailure = unknown> = Success<TSuccess> | Failure<TFailure>

export function isSuccess<TSuccess, TFailure>(
  result: Result<TSuccess, TFailure>
): result is Success<TSuccess> {
  return result.isSuccessResult
}

export function isFailure<TSuccess, TFailure>(
  result: Result<TSuccess, TFailure>
): result is Failure<TFailure> {
  return !result.isSuccessResult
}

export function successWith<T>(result: T): Success<T> {
  return { isSuccessResult: true, result }
}

export const emptySuccess = successWith(undefined)

export function failedWith(reason: string): Failure<unknown> {
  return failedWithResult(reason, undefined)
}

export function failedWithResult<T>(reason: string, failureResult: T): Failure<T> {
  return { isSuccessResult: false, reason, failureResult }
}
