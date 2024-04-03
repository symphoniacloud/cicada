import { LogFormatter, Logger, LogItem } from '@aws-lambda-powertools/logger'
import { LogAttributes, UnformattedAttributes } from '@aws-lambda-powertools/logger/types'

// Hat tip to https://chrisrich.io/aws-powertools-logging/ / https://github.com/ChristianRich/lambda-powertools-logger-typescript
class LocalLogFormatter extends LogFormatter {
  // eslint-disable-next-line class-methods-use-this
  public formatAttributes(attr: UnformattedAttributes, additionalLogAttributes: LogAttributes): LogItem {
    const logItem = new LogItem({
      attributes: {
        logLevel: attr.logLevel,
        message: attr.message
      }
    })
    logItem.addAttributes(additionalLogAttributes)
    return logItem
  }
}

// Initialized by middleware in ../middleware/standardMiddleware.ts
export const logger = calcEnvironmentAndCreateLogger()

function calcEnvironmentAndCreateLogger() {
  // Configuration in Lambda env is defined in CDK for when this is used in a Lambda environment
  // E.g. look for POWERTOOLS_ ... env vars
  if (isRunningInLambda()) return new Logger()
  const runningInVitest = process.env['VITEST'] === 'true'
  if (!runningInVitest) {
    console.log('WARNING - detected that not running in Lambda or in Vitest - using local logger')
  }
  return new Logger({
    logFormatter: new LocalLogFormatter(),
    logLevel: runningInVitest ? 'WARN' : 'DEBUG'
  })
}

function isRunningInLambda(env: NodeJS.ProcessEnv = process.env) {
  // See https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
  return '_HANDLER' in env
}
