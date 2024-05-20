import { Construct } from 'constructs'
import { ReportingStackProps } from './reportingStackProps'
import {
  DefinitionBody,
  JsonPath,
  LogLevel,
  Pass,
  StateMachine,
  StateMachineType
} from 'aws-cdk-lib/aws-stepfunctions'
import { stringArrayToCommaNewLineSeparated, topLevelGlueFields } from './schema'
import { ExecuteAthenaQueryStateMachineFragment } from '../constructs/ExecuteAthenaQueryStateMachineFragment'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam'
import { Rule } from 'aws-cdk-lib/aws-events'
import { CAPTURED_GITHUB_WORKFLOW_RUN_EVENTS_PREFIX } from './workflowRunEventCapture'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'
import { LogGroup } from 'aws-cdk-lib/aws-logs'

export function defineGithubWorkflowRunEventProcessing(scope: Construct, props: ReportingStackProps) {
  const stateMachine = new StateMachine(scope, `GithubWorkflowRunEventProcessingStateMachine`, {
    stateMachineName: `${props.appName}-github-workflow-run-event-processing`,
    stateMachineType: StateMachineType.EXPRESS,
    // Need to configure logs because Express Workflows don't have any diagnotics otherwise
    logs: {
      level: LogLevel.ALL,
      destination: new LogGroup(scope, 'GithubWorkflowRunEventProcessingStateMachineLogs', {
        logGroupName: `${props.appName}-github-workflow-run-event-processing`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: props.logRetention
      })
    },

    definitionBody: DefinitionBody.fromChainable(workflow(scope, props)),
    timeout: Duration.minutes(10)
  })
  // TODO - figure out narrower policy
  stateMachine.role.addManagedPolicy(
    ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSQuicksightAthenaAccess')
  )
  props.athenaOutputBucket.grantReadWrite(stateMachine)

  defineStateMachineTrigger(scope, props, stateMachine)
}

function workflow(scope: Construct, props: ReportingStackProps) {
  // Get event data and event time of new S3 objects from State Machine input (EventBridge event)
  const extractDateTime = new Pass(scope, 'ExtractDateTime', {
    parameters: {
      eventDate: JsonPath.arrayGetItem(
        JsonPath.stringSplit(
          JsonPath.arrayGetItem(
            JsonPath.stringSplit(JsonPath.stringAt('$$.Execution.Input.detail.object.key'), '/'),
            2
          ),
          '='
        ),
        1
      ),
      eventHour: JsonPath.arrayGetItem(
        JsonPath.stringSplit(
          JsonPath.arrayGetItem(
            JsonPath.stringSplit(JsonPath.stringAt('$$.Execution.Input.detail.object.key'), '/'),
            3
          ),
          '='
        ),
        1
      )
    },
    resultPath: '$.eventDateTime',
    outputPath: '$.eventDateTime'
  })

  const setUpsertQuery = setQueryString(
    scope,
    'SetUpsertQuery',
    JsonPath.format(
      upsertQuery(props.glueDatabaseName),
      JsonPath.stringAt('$.eventDate'),
      JsonPath.stringAt('$.eventHour')
    )
  )

  const runUpsertQuery = new ExecuteAthenaQueryStateMachineFragment(scope, 'UpsertWorkflowRunEvents', {
    athenaWorkgroupName: props.athenaWorkgroupName
  }).prefixStates('Upsert-')

  return extractDateTime.next(setUpsertQuery).next(runUpsertQuery)
}

function setQueryString(scope: Construct, id: string, queryString: string) {
  return new Pass(scope, id, {
    parameters: {
      queryString
    },
    resultPath: '$.query',
    outputPath: '$.query'
  })
}

function upsertQuery(dbName: string) {
  // The two '{}' 's below are substituted at Step Function execution time
  // according to the S3 path of the newly generated ingestion objects
  return `MERGE INTO ${dbName}.github_workflow_run_events target
USING (
    SELECT DISTINCT
        ${stringArrayToCommaNewLineSeparated(topLevelGlueFields)}
    FROM ${dbName}.captured_github_workflow_run_events
    WHERE event_date = date('{}') and event_hour = '{}'
) source
ON (target.id = source.id AND target.updated_at = source.updated_at AND target.status = source.status)
WHEN MATCHED
    THEN UPDATE SET
         ${stringArrayToCommaNewLineSeparated(topLevelGlueFields.map((f) => `${f} = source.${f}`))}
WHEN NOT MATCHED
    THEN INSERT (
    ${stringArrayToCommaNewLineSeparated(topLevelGlueFields)}
    )
    VALUES (
    ${stringArrayToCommaNewLineSeparated(topLevelGlueFields.map((f) => `source.${f}`))}
    )`
}

function defineStateMachineTrigger(scope: Construct, props: ReportingStackProps, stateMachine: StateMachine) {
  // Trigger ETL state machine whenever new workflow run events are ingested
  new Rule(scope, `GithubWorkflowRunEventProcessingTrigger`, {
    eventPattern: {
      source: ['aws.s3'],
      detailType: ['Object Created'],
      detail: {
        bucket: {
          name: [props.reportingIngestionBucket.bucketName]
        },
        object: {
          // Only trigger for run events
          key: [{ prefix: CAPTURED_GITHUB_WORKFLOW_RUN_EVENTS_PREFIX }]
        }
      }
    },
    targets: [new SfnStateMachine(stateMachine)]
  })
}
