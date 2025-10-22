import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { logger } from '../util/logging.js'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { tracer } from '../util/tracing.js'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { metrics } from '../util/metrics.js'

const loggingMiddleware = injectLambdaContext(logger)
const metricsMiddleware = logMetrics(metrics, { captureColdStartMetric: false, throwOnEmptyMetrics: false })
const tracingMiddleware = captureLambdaHandler(tracer)

export const powertoolsMiddlewares = [loggingMiddleware, metricsMiddleware, tracingMiddleware]
