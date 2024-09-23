import { Alarm, ComparisonOperator, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { Construct } from 'constructs'
import { MainStackProps } from './mainStackProps'
import { Duration } from 'aws-cdk-lib'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Topic } from 'aws-cdk-lib/aws-sns'

export function defineMonitoring(scope: Construct, props: MainStackProps) {
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
}
