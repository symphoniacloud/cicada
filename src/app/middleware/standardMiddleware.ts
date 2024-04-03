import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { logger } from '../util/logging'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { tracer } from '../util/tracing'

const loggingMiddleware = injectLambdaContext(logger)
const tracingMiddleware = captureLambdaHandler(tracer)

export const powertoolsMiddlewares = [loggingMiddleware, tracingMiddleware]
