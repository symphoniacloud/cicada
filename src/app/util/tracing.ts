import { Tracer } from '@aws-lambda-powertools/tracer'

// Configuration defined by environment variables in CDK when run in Lambda environment
// Powertools disables tracing when NOT run in a Lambda environment
export const tracer = new Tracer({})
