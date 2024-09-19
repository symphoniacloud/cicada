import { Metrics } from '@aws-lambda-powertools/metrics'

// Configuration in Lambda env is defined in CDK for when this is used in a Lambda environment
// E.g. look for POWERTOOLS_ ... env vars
export const metrics = new Metrics({})
