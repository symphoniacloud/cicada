import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { WithAppName } from '../config/allStacksProps'
import { EnvironmentSettings } from '../config/environmentSettings'

export interface CicadaCDKCustomResourceFunctionProps extends WithAppName, EnvironmentSettings {
  readonly functionName: string
  readonly timeoutSeconds: number
}

export class CicadaCDKCustomResourceFunction extends NodejsFunction {
  constructor(scope: Construct, props: CicadaCDKCustomResourceFunctionProps) {
    // Full logical name starts with current scope, so capitalize first character of function name for ID
    super(scope, `${props.functionName[0].toUpperCase()}${props.functionName.substring(1)}Function`, {
      functionName: `${props.appName}-${props.functionName}`,
      memorySize: 512,
      timeout: Duration.seconds(props.timeoutSeconds),
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      entry: `./customResourceLambdaFunctions/${props.functionName}/lambda.ts`,
      bundling: {
        target: 'node20',
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: false
      },
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        POWERTOOLS_LOGGER_LOG_EVENT: 'true',
        POWERTOOLS_METRICS_NAMESPACE: 'cicada',
        POWERTOOLS_SERVICE_NAME: props.appName,
        APP_NAME: props.appName
      },
      logRetention: props.logRetention
    })
  }
}
