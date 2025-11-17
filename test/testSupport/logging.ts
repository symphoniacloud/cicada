import { logger } from '../../src/app/util/logging.js'

export function withSuppressedWarningLogs<T>(testBody: () => T): T {
  logger.setLogLevel('ERROR')
  try {
    const result = testBody()
    // If result is a Promise, handle async case
    if (result instanceof Promise) {
      return result.finally(() => {
        changeLogLevelToWarn()
      }) as T
    }
    changeLogLevelToWarn()
    return result
  } catch (error) {
    // Ensure log level is restored on error
    changeLogLevelToWarn()
    throw error
  }
}

export function changeLogLevelToWarn() {
  logger.setLogLevel('WARN')
}
