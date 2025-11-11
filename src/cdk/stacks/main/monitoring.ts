import {
  Alarm,
  ComparisonOperator,
  MathExpression,
  Metric,
  TreatMissingData
} from 'aws-cdk-lib/aws-cloudwatch'
import { Construct } from 'constructs'
import { MainStackProps } from './mainStackProps.js'
import { Duration } from 'aws-cdk-lib'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { CicadaFunction } from '../../constructs/CicadaFunction.js'
import { AllStacksProps } from '../../config/allStacksProps.js'
import { FilterPattern, MetricFilter } from 'aws-cdk-lib/aws-logs'

export function defineMonitoring(scope: Construct, props: MainStackProps, lambdaFunctions: CicadaFunction[]) {
  const githubRateLimitRemainingAlarm = new Alarm(scope, 'Errors', {
    comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
    threshold: 1000,
    evaluationPeriods: 1,
    treatMissingData: TreatMissingData.IGNORE,
    alarmName: `${props.appName} - Github Rate Limit Remaining`,
    metric: new Metric({
      namespace: 'cicada',
      dimensionsMap: {
        service: props.appName
      },
      // ToEventually - this is a shared string with app code so move to constant
      metricName: 'githubRateLimitRemaining',
      statistic: 'Minimum',
      period: Duration.days(1)
    })
  })

  const actionTopic = new Topic(scope, 'alarmActionTopic', { topicName: `${props.appName}-alarms` })
  githubRateLimitRemainingAlarm.addAlarmAction(new SnsAction(actionTopic))

  if (props.deployDetailedMonitoring) {
    defineLambdaFunctionDetailedMonitoring(scope, props, lambdaFunctions, actionTopic)
  }
}

function defineLambdaFunctionDetailedMonitoring(
  scope: Construct,
  props: AllStacksProps,
  lambdaFunctions: CicadaFunction[],
  alarmTopic: Topic
) {
  // For each Lambda function, create a custom metric which is the total number of WARN or ERROR logs
  //  output in each function's log group
  const logProblemMetrics = lambdaFunctions.map((lambdaFunction) => {
    return new MetricFilter(scope, `${lambdaFunction.fullFunctionName}LogProblemFilter`, {
      logGroup: lambdaFunction.logGroup,
      filterPattern: FilterPattern.any(
        FilterPattern.stringValue('$.level', '=', 'WARN'),
        FilterPattern.stringValue('$.level', '=', 'ERROR')
      ),
      metricNamespace: `${props.appName}`,
      metricName: `${lambdaFunction.functionName}LogProblemCount`
    }).metric()
  })

  // Create an alarm which sums all the above metrics, and alarms if more than zero
  const logProblemsAlarm = new Alarm(scope, 'LogProblemsAlarm', {
    alarmName: `${props.appName}-log-problems`,
    comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
    threshold: 0,
    evaluationPeriods: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: new MathExpression({
      usingMetrics: logProblemMetrics.reduce((acc: Record<string, Metric>, metric, i) => {
        acc[`m${i}`] = metric
        return acc
      }, {}),
      expression: logProblemMetrics.map((_, i) => `m${i}`).join(' + '),
      period: Duration.minutes(5)
    })
  })

  // Add this alarm to the same alarm action as used in main monitoring
  logProblemsAlarm.addAlarmAction(new SnsAction(alarmTopic))
  logProblemsAlarm.addOkAction(new SnsAction(alarmTopic))
}
