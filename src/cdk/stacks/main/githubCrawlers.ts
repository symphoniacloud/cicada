import { Construct } from 'constructs'
import { MainStackProps } from './mainStackProps'
import { CicadaFunction, cicadaFunctionProps } from './constructs/CicadaFunction'
import {
  DefinitionBody,
  IntegrationPattern,
  JsonPath,
  Map,
  StateMachine,
  TaskInput
} from 'aws-cdk-lib/aws-stepfunctions'
import { LambdaInvoke, StepFunctionsStartExecution } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { CRAWLABLE_RESOURCES } from '../../../multipleContexts/githubCrawler'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { Duration } from 'aws-cdk-lib'

export function defineGithubCrawlers(scope: Construct, props: MainStackProps) {
  const crawlerFunction = defineGithubCrawlerFunction(scope, props)
  const installationCrawler = defineInstallationCrawler(scope, props, crawlerFunction)
  const allInstallationsCrawler = defineAllInstallationsCrawler(
    scope,
    props,
    crawlerFunction,
    installationCrawler
  )
  defineOnInstallationUpdatedProcessor(scope, props, installationCrawler)
  defineSchedules(scope, allInstallationsCrawler)
}

function defineGithubCrawlerFunction(scope: Construct, props: MainStackProps) {
  return new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubCrawlTask', {
      memorySize: 512,
      timeoutSeconds: 600,
      tablesReadWriteAccess: [
        'github-installations',
        'github-users',
        'github-account-memberships',
        'github-repositories',
        'github-repo-activity',
        'github-latest-workflow-runs',
        'github-latest-pushes-per-ref'
      ]
    })
  )
}

function defineInstallationCrawler(scope: Construct, props: MainStackProps, crawlerFunction: CicadaFunction) {
  const crawlUsers = new LambdaInvoke(scope, 'crawlUsers', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.USERS,
      installation: JsonPath.objectAt('$.installation')
    }),
    // Pass through original input to next state
    resultPath: JsonPath.DISCARD
  })

  const crawlRepositories = new LambdaInvoke(scope, 'crawlRepositories', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.REPOSITORIES,
      installation: JsonPath.objectAt('$.installation')
    }),
    resultSelector: {
      repositories: JsonPath.objectAt('$.Payload')
    },
    resultPath: '$.repositoriesCrawler'
  })

  const crawlPushes = new LambdaInvoke(scope, 'crawlPushes', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.PUSHES,
      installation: JsonPath.objectAt('$.installation'),
      repository: JsonPath.objectAt('$.repository')
    }),
    // Pass through original input to next state
    resultPath: JsonPath.DISCARD
  })

  const crawlWorkflowRunEvents = new LambdaInvoke(scope, 'crawlWorkflowRunEvents', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.WORKFLOW_RUN_EVENTS,
      installation: JsonPath.objectAt('$.installation'),
      repository: JsonPath.objectAt('$.repository'),
      lookbackDays: JsonPath.numberAt('$$.Execution.Input.lookbackDays')
    }),
    outputPath: '$.Payload'
  })

  // TOEventually - put this into separate state machine for crawling public repos
  // TOEventually - need to consider github app rate limiting (max 5000 requests / hour, etc.)
  const forEachRepository = new Map(scope, 'forEachRepository', {
    maxConcurrency: 10,
    itemsPath: '$.repositoriesCrawler.repositories',
    itemSelector: {
      installation: JsonPath.objectAt('$.installation'),
      repository: JsonPath.objectAt('$$.Map.Item.Value')
    }
  })
  forEachRepository.itemProcessor(crawlPushes.next(crawlWorkflowRunEvents))

  const workflow = crawlUsers.next(crawlRepositories).next(forEachRepository)

  return new StateMachine(scope, 'installationCrawler', {
    stateMachineName: `${props.appName}-installation`,
    comment: 'Crawl a GitHub App Installation and child resources',
    definitionBody: DefinitionBody.fromChainable(workflow),
    tracingEnabled: true
  })
}

// TOEventually - at some point need to find old installations and delete them
// TOEventually - add error handling
function defineAllInstallationsCrawler(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction,
  installationCrawler: StateMachine
) {
  const crawlInstallations = new LambdaInvoke(scope, 'crawlInstallations', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.INSTALLATIONS
    }),
    outputPath: '$.Payload'
  })

  const invokeInstallationCrawler = new StepFunctionsStartExecution(
    scope,
    'allInstallationsInvokeInstallationCrawler',
    {
      stateMachine: installationCrawler,
      // This is the configuration for "run and wait" - "REQUEST_RESPONSE" is *incorrect* for that
      integrationPattern: IntegrationPattern.RUN_JOB,
      // Sets up runtime link between the caller and callee workflows
      associateWithParent: true,
      // Have to explicitly include input because using `associateWithParent`
      input: TaskInput.fromObject({
        installation: JsonPath.entirePayload,
        // This crawler runs daily, so look back N + 1 days
        lookbackDays: 2
      })
    }
  )

  const forEachInstallation = new Map(scope, 'forEachInstallation', {})
  forEachInstallation.itemProcessor(invokeInstallationCrawler)

  const workflow = crawlInstallations.next(forEachInstallation)

  return new StateMachine(scope, 'allInstallationsCrawler', {
    stateMachineName: `${props.appName}-all-installations`,
    comment: 'Crawl all GitHub App Installations and child resources',
    definitionBody: DefinitionBody.fromChainable(workflow),
    tracingEnabled: true
  })
}

function defineOnInstallationUpdatedProcessor(
  scope: Construct,
  props: MainStackProps,
  installationCrawler: StateMachine
) {
  // In theory I think it should be possible just to use event manipulation in the event rule,
  // rather than a whole new step function, but I couldn't figure out how to merge dynamic and static
  // content in the even rule target properties

  const onInstallationUpdatedProcessor = new StateMachine(scope, 'onInstallationUpdatedProcessor', {
    stateMachineName: `${props.appName}-on-installation-updated`,
    comment: 'Crawl installation and child resources when installation updated',
    definitionBody: DefinitionBody.fromChainable(
      new StepFunctionsStartExecution(scope, 'onInstallationUpdatedInvokeInstallationCrawler', {
        stateMachine: installationCrawler,
        integrationPattern: IntegrationPattern.RUN_JOB,
        associateWithParent: true,
        input: TaskInput.fromObject({
          installation: JsonPath.objectAt('$.detail.data'),
          // TOEventually - consider making this longer, at least for new installations
          lookbackDays: 30
        })
      })
    ),
    tracingEnabled: true
  })

  new Rule(scope, 'installationUpdatedStepFunctionRule', {
    description: `Run Installation Crawler when installation updated`,
    eventPattern: {
      source: [props.appName],
      detailType: [EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED]
    },
    targets: [new SfnStateMachine(onInstallationUpdatedProcessor)]
  })
}

function defineSchedules(scope: Construct, allInstallationsCrawler: StateMachine) {
  new Rule(scope, 'ScheduleRule', {
    description: 'Scheduled All Installations Crawl',
    schedule: Schedule.rate(Duration.days(1)),
    targets: [new SfnStateMachine(allInstallationsCrawler)]
  })
}
