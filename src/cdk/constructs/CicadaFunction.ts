import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { aws_lambda as lambda, Duration } from 'aws-cdk-lib'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { CicadaTableId } from '../../multipleContexts/dynamoDBTables'
import { MainStackProps } from '../stacks/main/mainStackProps'

export interface CicadaFunctionProps extends MainStackProps {
  readonly functionName: string
  readonly memorySize: number
  readonly timeoutSeconds: number
  readonly tablesReadAccess?: CicadaTableId[]
  readonly tablesReadWriteAccess?: CicadaTableId[]
}

export function cicadaFunctionProps(
  props: MainStackProps,
  functionName: string,
  overrides: Partial<CicadaFunctionProps> = {}
): CicadaFunctionProps {
  return {
    ...props,
    functionName,
    memorySize: 1769,
    timeoutSeconds: 29,
    ...overrides
  }
}

export class CicadaFunction extends NodejsFunction {
  constructor(scope: Construct, props: CicadaFunctionProps) {
    // Full logical name starts with current scope, so capitalize first character of function name for ID
    super(scope, `${props.functionName[0].toUpperCase()}${props.functionName.substring(1)}Function`, {
      functionName: `${props.appName}-${props.functionName}`,
      memorySize: props.memorySize,
      timeout: Duration.seconds(props.timeoutSeconds),
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      entry: `../app/lambdaFunctions/${props.functionName}/lambda.ts`,
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        target: 'node20',
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: false
      },
      environment: {
        POWERTOOLS_LOG_LEVEL: props.logLevel,
        POWERTOOLS_LOGGER_LOG_EVENT: `${props.logFullEvents}`,
        POWERTOOLS_METRICS_NAMESPACE: 'cicada',
        POWERTOOLS_PARAMETERS_MAX_AGE: `${props.parametersMaxAgeSeconds}`,
        POWERTOOLS_SERVICE_NAME: props.appName,
        APP_NAME: props.appName
      },
      logRetention: props.logRetention
    })
    this.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameters'],
        resources: [`arn:aws:ssm:${props.env.region}:${props.env.account}:parameter/${props.appName}/*`]
      })
    )
    for (const tableId of props.tablesReadAccess ?? []) {
      props.allTables[tableId].grantReadData(this)
    }
    for (const tableId of props.tablesReadWriteAccess ?? []) {
      props.allTables[tableId].grantReadWriteData(this)
    }
  }
}
