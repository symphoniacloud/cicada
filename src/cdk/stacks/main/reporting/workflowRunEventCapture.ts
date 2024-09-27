import { Construct } from 'constructs'
import { ReportingStackProps } from './reportingStackProps'
import { Aws, RemovalPolicy } from 'aws-cdk-lib'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../multipleContexts/eventBridge'
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose'
import { CfnTable } from 'aws-cdk-lib/aws-glue'
import { EventBridgeToFirehose } from '../../../constructs/EventBridgeToFirehose'
import { PartitioningJSONFirehose } from '../../../constructs/PartitioningJSONFirehose'
import { githubWorkflowGlueSchema } from './schema'

export function defineGithubWorkflowRunEventCapture(scope: Construct, props: ReportingStackProps) {
  defineCapturePipe(scope, props, defineGithubWorkflowRunEventFirehose(scope, props))
  defineCapturedGithubWorkflowRunEventsTable(scope, props)
}

function defineCapturePipe(scope: Construct, props: ReportingStackProps, firehose: CfnDeliveryStream) {
  new EventBridgeToFirehose(scope, 'GithubWorkflowRunEventCapturePipe', {
    env: props.env,
    naming: {
      name: 'github-workflow-run-event-capture',
      prefix: props.appName
    },
    eventPattern: {
      source: [props.appName],
      detailType: [EVENTBRIDGE_DETAIL_TYPES.GITHUB_REPO_ACTIVITY_TABLE_UPDATED],
      // Only capture events where _et (entity type) is githubWorkflowRunEvent
      detail: {
        dynamodb: {
          NewImage: {
            _et: {
              S: ['githubWorkflowRunEvent']
            }
          }
        }
      }
    },
    firehoseArn: firehose.attrArn,
    targetParameters: {
      // TODO - consider using a Lambda enrichment function for this instead
      inputTemplate:
        '{' +
        '"account_id": <$.body.detail.dynamodb.NewImage.accountId.N>,' +
        '"account_name": <$.body.detail.dynamodb.NewImage.ownerName.S>,' +
        '"account_type": <$.body.detail.dynamodb.NewImage.ownerType.S>,' +
        '"repo_id": <$.body.detail.dynamodb.NewImage.repoId.N>,' +
        '"repo_name": <$.body.detail.dynamodb.NewImage.repoName.S>,' +
        '"repo_html_url": <$.body.detail.dynamodb.NewImage.repoHtmlUrl.S>,' +
        '"workflow_id": <$.body.detail.dynamodb.NewImage.workflowId.N>,' +
        '"workflow_name": <$.body.detail.dynamodb.NewImage.workflowName.S>,' +
        '"path": <$.body.detail.dynamodb.NewImage.path.S>,' +
        '"workflow_html_url": <$.body.detail.dynamodb.NewImage.workflowHtmlUrl.S>,' +
        '"workflow_badge_url": <$.body.detail.dynamodb.NewImage.workflowBadgeUrl.S>,' +
        '"id": <$.body.detail.dynamodb.NewImage.id.N>,' +
        '"run_number": <$.body.detail.dynamodb.NewImage.runNumber.N>,' +
        '"run_attempt": <$.body.detail.dynamodb.NewImage.runAttempt.N>,' +
        '"display_title": <$.body.detail.dynamodb.NewImage.displayTitle.S>,' +
        '"event": <$.body.detail.dynamodb.NewImage.event.S>,' +
        '"status": <$.body.detail.dynamodb.NewImage.status.S>,' +
        '"head_branch": <$.body.detail.dynamodb.NewImage.headBranch.S>,' +
        '"head_sha": <$.body.detail.dynamodb.NewImage.headSha.S>,' +
        '"conclusion": <$.body.detail.dynamodb.NewImage.conclusion.S>,' +
        '"created_at": <$.body.detail.dynamodb.NewImage.createdAt.S>,' +
        '"updated_at": <$.body.detail.dynamodb.NewImage.updatedAt.S>,' +
        '"run_started_at": <$.body.detail.dynamodb.NewImage.runStartedAt.S>,' +
        '"html_url": <$.body.detail.dynamodb.NewImage.htmlUrl.S>,' +
        '"actor": {' +
        '"login": <$.body.detail.dynamodb.NewImage.actor.M.login.S>,' +
        '"id": <$.body.detail.dynamodb.NewImage.actor.M.id.N>,' +
        '"avatar_url": <$.body.detail.dynamodb.NewImage.actor.M.avatarUrl.S>,' +
        '"html_url": <$.body.detail.dynamodb.NewImage.actor.M.htmlUrl.S>' +
        '\n}' +
        '\n}'
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

export const CAPTURED_GITHUB_WORKFLOW_RUN_EVENTS_PREFIX = 'tables/github-workflow-run-event-captured/'

function defineGithubWorkflowRunEventFirehose(scope: Construct, props: ReportingStackProps) {
  return new PartitioningJSONFirehose(scope, 'GithubWorkflowRunEventCaptureFirehose', {
    env: props.env,
    naming: {
      name: 'github-workflow-run-event-capture',
      prefix: props.appName
    },
    bucket: props.reportingIngestionBucket,
    metadataExtractionParameterValue:
      '{' +
      'event_date : .updated_at | fromdate | strftime("%Y-%m-%d"), ' +
      'event_hour : .updated_at | fromdate | strftime("%H")' +
      '}',
    prefix:
      CAPTURED_GITHUB_WORKFLOW_RUN_EVENTS_PREFIX +
      'event_date=!{partitionKeyFromQuery:event_date}/' +
      'event_hour=!{partitionKeyFromQuery:event_hour}/',
    errorOutputPrefix: 'errors/github-workflow-run-event-captured/'
  }).firehose
}

function defineCapturedGithubWorkflowRunEventsTable(scope: Construct, props: ReportingStackProps) {
  const table = new CfnTable(scope, `CapturedGithubWorkflowRunEventsTable`, {
    catalogId: Aws.ACCOUNT_ID,
    databaseName: props.glueDatabaseName,
    tableInput: {
      name: 'captured_github_workflow_run_events',
      partitionKeys: [
        {
          name: 'event_date',
          type: 'date'
        },
        {
          name: 'event_hour',
          type: 'string'
        }
      ],
      storageDescriptor: {
        location: `s3://${props.reportingIngestionBucket.bucketName}/${CAPTURED_GITHUB_WORKFLOW_RUN_EVENTS_PREFIX}`,
        inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
        outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
        serdeInfo: {
          serializationLibrary: 'org.openx.data.jsonserde.JsonSerDe'
        },
        compressed: true,
        columns: githubWorkflowGlueSchema
      },
      tableType: 'EXTERNAL_TABLE',
      parameters: {
        classification: 'json',
        compressionType: 'gzip',
        'projection.event_date.type': 'date',
        'projection.event_date.range': '2024-05-10,NOW',
        'projection.event_date.format': 'yyyy-MM-dd',
        'projection.event_hour.type': 'integer',
        'projection.event_hour.range': '0,23',
        'projection.event_hour.digits': '2',
        'projection.enabled': 'true'
      }
    }
  })
  table.applyRemovalPolicy(RemovalPolicy.DESTROY)

  return table
}
