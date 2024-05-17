import { Construct } from 'constructs'
import { ReportingStackProps } from './reportingStackProps'
import { RemovalPolicy } from 'aws-cdk-lib'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../multipleContexts/eventBridge'
import { DynamoDBStreamFanOut } from '../constructs/DynamoDBStreamFanOut'

export function defineRepoActivityDynamoDBStreamFanOut(scope: Construct, props: ReportingStackProps) {
  new DynamoDBStreamFanOut(scope, 'GithubRepoActivityFanOut', {
    env: props.env,
    naming: {
      name: 'github-repo-activity-fan-out',
      prefix: props.appName
    },
    table: props.githubRepoActivityTable,
    streamProperties: {
      startingPosition: StartingPosition.LATEST
    },
    eventBridgeProperties: {
      source: props.appName,
      detailType: EVENTBRIDGE_DETAIL_TYPES.GITHUB_REPO_ACTIVITY_TABLE_UPDATED
    },
    log: {
      level: 'INFO',
      logGroupProps: {
        removalPolicy: RemovalPolicy.DESTROY,
        retention: props.logRetention
      }
    }
  })
}
