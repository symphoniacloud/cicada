import { logger } from '../../src/app/util/logging.js'

export function changeLogLevelToError() {
  logger.setLogLevel('ERROR')
}

export function changeLogLevelToWarn() {
  logger.setLogLevel('WARN')
}
