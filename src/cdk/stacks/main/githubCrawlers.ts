import { Construct } from 'constructs'
import { MainStackProps } from './mainStackProps.js'
import { CicadaFunction, cicadaFunctionProps } from '../../constructs/CicadaFunction.js'
import { DefinitionBody, JsonPath, Map, StateMachine, TaskInput } from 'aws-cdk-lib/aws-stepfunctions'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { CRAWLABLE_RESOURCES } from '../../../multipleContexts/githubCrawler.js'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { Duration } from 'aws-cdk-lib'

export function defineGithubCrawlers(scope: Construct, props: MainStackProps) {
  const crawlerFunction = defineGithubCrawlerFunction(scope, props)
  defineScheduledAllInstallationsCrawler(scope, props, crawlerFunction)
  defineScheduledAllPublicAccountsCrawler(scope, props, crawlerFunction)
  defineOnInstallationUpdatedProcessor(scope, props, crawlerFunction)
  defineOnPublicAccountUpdatedProcessor(scope, props, crawlerFunction)
}

function defineGithubCrawlerFunction(scope: Construct, props: MainStackProps) {
  return new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubCrawler', {
      memorySize: 512,
      timeoutSeconds: 900,
      tablesReadWriteAccess: [
        'github-installations',
        'github-users',
        'github-account-memberships',
        'github-repositories',
        'github-workflows',
        'github-repo-activity',
        'github-latest-workflow-runs',
        'github-latest-pushes-per-ref',
        'github-public-accounts'
      ]
    })
  )
}

// TOEventually - at some point need to find old installations and delete them
// TOEventually - add error handling
function defineScheduledAllInstallationsCrawler(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  const crawlInstallations = new LambdaInvoke(scope, 'invokeCrawlerForAllInstallations', {
    lambdaFunction: crawlerFunction,
    payload: TaskInput.fromObject({
      resourceType: CRAWLABLE_RESOURCES.INSTALLATIONS
    }),
    outputPath: '$.Payload'
  })

  // No "max concurrency" specified, so do this in parallel
  // That's OK because each invocation will use its own Github Installation, and therefore a different auth token
  const forEachInstallation = new Map(scope, 'invokeCrawlerForInstallation', {})
  forEachInstallation.itemProcessor(
    new LambdaInvoke(scope, 'crawlInstallation', {
      lambdaFunction: crawlerFunction,
      payload: TaskInput.fromObject({
        resourceType: CRAWLABLE_RESOURCES.INSTALLATION,
        installation: JsonPath.entirePayload,
        lookbackDays: 2
      })
    })
  )

  new Rule(scope, 'scheduledAllInstallationsCrawlRule', {
    description: 'Scheduled All Installations Crawl',
    schedule: Schedule.rate(Duration.days(1)),
    targets: [
      new SfnStateMachine(
        new StateMachine(scope, 'allInstallationsCrawler', {
          stateMachineName: `${props.appName}-all-installations`,
          comment: 'Crawl all GitHub App Installations and child resources',
          definitionBody: DefinitionBody.fromChainable(crawlInstallations.next(forEachInstallation)),
          tracingEnabled: true
        })
      )
    ]
  })
}

function defineScheduledAllPublicAccountsCrawler(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  new Rule(scope, 'scheduledAllPublicAccountsCrawlRule', {
    description: `Crawl all public accounts`,
    schedule: Schedule.rate(Duration.hours(1)),
    targets: [
      new SfnStateMachine(
        new StateMachine(scope, 'allPublicAccountsCrawler', {
          stateMachineName: `${props.appName}-all-public-accounts`,
          comment: 'Crawl all public accounts',
          definitionBody: DefinitionBody.fromChainable(
            new LambdaInvoke(scope, 'crawlPublicAccounts', {
              lambdaFunction: crawlerFunction,
              payload: TaskInput.fromObject({
                resourceType: CRAWLABLE_RESOURCES.PUBLIC_ACCOUNTS,
                lookbackHours: 2
              })
            })
          ),
          tracingEnabled: true
        })
      )
    ]
  })
}

function defineOnInstallationUpdatedProcessor(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  new Rule(scope, 'installationUpdatedStepFunctionRule', {
    description: `Run Installation Crawler when installation updated`,
    eventPattern: {
      source: [props.appName],
      detailType: [EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED]
    },
    targets: [
      // Use a State Machine here even though just calling a Lambda Function so that later
      // can think about adding retry logic
      new SfnStateMachine(
        new StateMachine(scope, 'onInstallationUpdatedProcessor', {
          stateMachineName: `${props.appName}-on-installation-updated`,
          comment: 'Crawl installation and child resources when installation updated',
          definitionBody: DefinitionBody.fromChainable(
            new LambdaInvoke(scope, 'invokeCrawlerOnInstallationUpdated', {
              lambdaFunction: crawlerFunction,
              payload: TaskInput.fromObject({
                resourceType: CRAWLABLE_RESOURCES.INSTALLATION,
                installation: JsonPath.objectAt('$.detail.data'),
                lookbackDays: 30
              })
            })
          ),
          tracingEnabled: true
        })
      )
    ]
  })
}

function defineOnPublicAccountUpdatedProcessor(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  new Rule(scope, 'publicAccountUpdatedStepFunctionRule', {
    description: `Run Public Account Crawler when public account updated`,
    eventPattern: {
      source: [props.appName],
      detailType: [EVENTBRIDGE_DETAIL_TYPES.PUBLIC_ACCOUNT_UPDATED]
    },
    targets: [
      // Use a State Machine here even though just calling a Lambda Function so that later
      // can think about adding retry logic
      new SfnStateMachine(
        new StateMachine(scope, 'onPublicAccountUpdatedProcessor', {
          stateMachineName: `${props.appName}-on-public-account-updated`,
          comment: 'Crawl a Public Account and child resources when public account updated',
          definitionBody: DefinitionBody.fromChainable(
            new LambdaInvoke(scope, 'invokeCrawlerOnPublicAccountUpdated', {
              lambdaFunction: crawlerFunction,
              payload: TaskInput.fromObject({
                resourceType: CRAWLABLE_RESOURCES.PUBLIC_ACCOUNT,
                installation: JsonPath.objectAt('$.detail.data.installation'),
                publicAccountId: JsonPath.numberAt('$.detail.data.publicAccountId'),
                lookbackHours: 3 * 24
              })
            })
          ),
          tracingEnabled: true
        })
      )
    ]
  })
}
