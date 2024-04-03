import { Construct } from 'constructs'
import { CicadaFunction, cicadaFunctionProps } from './constructs/CicadaFunction'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { AwsIntegration, LambdaIntegration, PassthroughBehavior, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { grantLambdaFunctionPermissionToPutEvents } from '../../support/eventbridge'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { SSM_PARAM_NAMES } from '../../../multipleContexts/ssmParams'
import { saveInSSMViaCloudFormation } from '../../support/ssm'
import { Duration } from 'aws-cdk-lib'
import { MainStackProps } from './mainStackProps'

export interface GithubInteractionProps extends MainStackProps {
  readonly restApi: RestApi
}

export function defineGithubInteraction(scope: Construct, props: GithubInteractionProps) {
  defineAuth(scope, props)
  defineScheduledCrawler(scope, props)
  defineWebhook(scope, props)
  defineWebhookFunction(scope, props)
}

function defineAuth(scope: Construct, props: GithubInteractionProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubAuth', {
      tablesReadAccess: ['github-users']
    })
  )
  props.restApi.root
    .addResource('auth')
    .addResource('github')
    .addResource('{proxy+}')
    .addMethod(HttpMethod.GET, new LambdaIntegration(lambdaFunction))

  saveInSSMViaCloudFormation(
    scope,
    props,
    SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET,
    props.randomizedValues.githubWebhookSecret
  )

  // Random state used during callback.
  // Consider a better option longer term (e.g. DynamoDB value with TTL)
  saveInSSMViaCloudFormation(
    scope,
    props,
    SSM_PARAM_NAMES.GITHUB_LOGIN_CALLBACK_STATE,
    props.randomizedValues.githubLoginCallbackState
  )
}

function defineScheduledCrawler(scope: Construct, props: GithubInteractionProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubCrawler', {
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
  grantLambdaFunctionPermissionToPutEvents(lambdaFunction, props)
  new Rule(scope, 'ScheduleRule', {
    description: 'Scheduled Github Crawler',
    schedule: Schedule.rate(Duration.days(1)),
    targets: [new LambdaFunction(lambdaFunction)]
  })
}

const EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX = 'githubWebhook/'

function defineWebhook(scope: Construct, props: GithubInteractionProps) {
  const { eventsBucket } = props

  const githubWebhookS3IntegrationRole = new Role(scope, 'GithubWebhookS3IntegrationRole', {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
  })
  githubWebhookS3IntegrationRole.addToPolicy(
    new PolicyStatement({
      resources: [`${eventsBucket.bucketArn}/${EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX}*`],
      actions: ['s3:PutObject']
    })
  )

  const s3Integration = new AwsIntegration({
    service: 's3',
    region: props.env.region,
    integrationHttpMethod: 'PUT',
    path: `${eventsBucket.bucketName}/${EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX}{item}.json`,
    options: {
      // Use these values from original headers as part of call to S3
      requestParameters: {
        // X-Github-Delivery is unique per webhook request, so use it to uniquely create key names
        'integration.request.path.item': 'method.request.header.X-GitHub-Delivery',
        'integration.request.header.Accept': 'method.request.header.Accept'
      },
      // We need a couple of headers from the original webhook, and not just the body,
      // so define a request template to generate a JSON object with those headers, and the
      // original body, as fields
      requestTemplates: {
        'application/json': JSON.stringify({
          'X-Hub-Signature-256': "$util.escapeJavaScript($input.params('X-Hub-Signature-256'))",
          'X-GitHub-Event': "$util.escapeJavaScript($input.params('X-GitHub-Event'))",
          body: '$util.escapeJavaScript($input.body)'
        })
      },
      // Don't passthrough body if content type is unexpected (should always be application/json)
      passthroughBehavior: PassthroughBehavior.NEVER,
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': 'integration.response.header.Content-Type'
          }
        }
      ],
      credentialsRole: githubWebhookS3IntegrationRole
    }
  })

  const webhookURLCode = props.randomizedValues.githubWebhookURLCode
  // Save webhook code so that we don't change it every time (see allStacksProps.ts)
  // Ideally this would be via a Custom Resource
  saveInSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE, webhookURLCode)

  props.restApi.root
    .addResource('github')
    .addResource('webhook')
    .addResource(webhookURLCode)
    .addMethod(HttpMethod.POST, s3Integration, {
      // These headers are needed by s3Integration
      requestParameters: {
        'method.request.header.Accept': true,
        'method.request.header.X-GitHub-Delivery': true,
        'method.request.header.X-GitHub-Event': true,
        'method.request.header.X-Hub-Signature-256': true
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true
          }
        }
      ]
    })
}

function defineWebhookFunction(scope: Construct, props: GithubInteractionProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubWebhookViaS3', {
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
  grantLambdaFunctionPermissionToPutEvents(lambdaFunction, props)
  props.eventsBucket.grantRead(lambdaFunction, `${EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX}*`)
  new Rule(scope, 'GithubWebhookFunctionRule', {
    description: `Process Github Webhook events saved in S3`,
    eventPattern: {
      source: ['aws.s3'],
      detailType: ['Object Created'],
      detail: {
        bucket: {
          name: [props.eventsBucket.bucketName]
        },
        object: {
          // TOEventually Can we add suffix check too, as an 'and' ?
          key: [{ prefix: EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX }]
        }
      }
    },
    targets: [new targets.LambdaFunction(lambdaFunction)]
  })
}
