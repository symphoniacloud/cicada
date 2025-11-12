import { Construct } from 'constructs'
import { MainStackProps } from './mainStackProps.js'
import { CicadaFunction, cicadaFunctionProps } from '../../constructs/CicadaFunction.js'
import { DefinitionBody, JsonPath, StateMachine, TaskInput } from 'aws-cdk-lib/aws-stepfunctions'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { CRAWLABLE_RESOURCES } from '../../../multipleContexts/githubCrawler.js'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { SfnStateMachine } from 'aws-cdk-lib/aws-events-targets'
import { Duration } from 'aws-cdk-lib'
import {
  EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING,
  EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED
} from '../../../multipleContexts/eventBridgeSchemas.js'
import { grantLambdaFunctionPermissionToPutEvents } from '../../support/eventbridge.js'

export function defineGithubCrawlers(scope: Construct, props: MainStackProps) {
  const crawlerFunction = defineGithubCrawlerFunction(scope, props)
  defineScheduledAllInstallationsCrawler(scope, props, crawlerFunction)
  defineScheduledAllPublicAccountsCrawler(scope, props, crawlerFunction)
  defineOnInstallationRequiresCrawlingProcessor(scope, props, crawlerFunction)
  defineOnPublicAccountUpdatedProcessor(scope, props, crawlerFunction)
  return { functions: [crawlerFunction] }
}

function defineGithubCrawlerFunction(scope: Construct, props: MainStackProps) {
  const lambdaFunction = new CicadaFunction(
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
  grantLambdaFunctionPermissionToPutEvents(lambdaFunction, props)
  return lambdaFunction
}

// TOEventually - at some point need to find old installations and delete them
// TOEventually - add error handling
function defineScheduledAllInstallationsCrawler(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  new Rule(scope, 'scheduledAllInstallationsCrawlRule', {
    description: 'Scheduled All Installations Crawl',
    schedule: Schedule.rate(Duration.days(1)),
    targets: [
      // Use a State Machine here even though just calling a Lambda Function so that later
      // can think about adding retry logic
      new SfnStateMachine(
        new StateMachine(scope, 'allInstallationsCrawler', {
          stateMachineName: `${props.appName}-all-installations`,
          comment: 'Crawl all GitHub App Installations',
          definitionBody: DefinitionBody.fromChainable(
            new LambdaInvoke(scope, 'invokeCrawlerForAllInstallations', {
              lambdaFunction: crawlerFunction,
              payload: TaskInput.fromObject({
                resourceType: CRAWLABLE_RESOURCES.INSTALLATIONS
              }),
              outputPath: '$.Payload'
            })
          ),
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

function defineOnInstallationRequiresCrawlingProcessor(
  scope: Construct,
  props: MainStackProps,
  crawlerFunction: CicadaFunction
) {
  new Rule(scope, 'installationRequiresCrawlingStepFunctionRule', {
    description: `Run Installation Crawler`,
    eventPattern: {
      source: [props.appName],
      detailType: [EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING]
    },
    targets: [
      // Use a State Machine here even though just calling a Lambda Function so that later
      // can think about adding retry logic
      new SfnStateMachine(
        new StateMachine(scope, 'onInstallationRequiresCrawling', {
          stateMachineName: `${props.appName}-on-installation-requires-crawling`,
          comment: 'Crawl installation and child resources',
          definitionBody: DefinitionBody.fromChainable(
            new LambdaInvoke(scope, 'invokeCrawlerOnInstallationRequiresCrawling', {
              lambdaFunction: crawlerFunction,
              payload: TaskInput.fromObject({
                resourceType: CRAWLABLE_RESOURCES.INSTALLATION,
                installation: JsonPath.objectAt('$.detail.data.installation'),
                lookbackDays: JsonPath.numberAt('$.detail.data.lookbackDays')
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
      detailType: [EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED]
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
