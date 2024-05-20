import { Construct } from 'constructs'
import { CicadaFunction, cicadaFunctionProps } from '../../constructs/CicadaFunction'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import {
  AwsIntegration,
  LambdaIntegration,
  PassthroughBehavior,
  Resource,
  RestApi
} from 'aws-cdk-lib/aws-apigateway'
import { grantLambdaFunctionPermissionToPutEvents } from '../../support/eventbridge'
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Rule } from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import { MainStackProps } from './mainStackProps'

export interface GithubInteractionProps extends MainStackProps {
  readonly restApi: RestApi
}

export function defineGithubInteraction(scope: Construct, props: GithubInteractionProps) {
  const githubApiResource = props.restApi.root.addResource('github')

  defineSetup(scope, props, githubApiResource)
  defineAuth(scope, props, githubApiResource)
  defineWebhook(scope, props, githubApiResource)
  defineWebhookFunction(scope, props)
}

function defineSetup(scope: Construct, props: GithubInteractionProps, githubApiResource: Resource) {
  const lambdaFunction = new CicadaFunction(scope, cicadaFunctionProps(props, 'githubSetup'))
  githubApiResource
    .addResource('setup')
    .addResource('{proxy+}')
    .addMethod(HttpMethod.GET, new LambdaIntegration(lambdaFunction))

  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [`arn:aws:ssm:${props.env.region}:${props.env.account}:parameter/${props.appName}/*`],
      actions: ['ssm:PutParameter']
    })
  )
}

function defineAuth(scope: Construct, props: GithubInteractionProps, githubApiResource: Resource) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'githubAuth', {
      tablesReadAccess: ['github-users']
    })
  )
  githubApiResource
    .addResource('auth')
    .addResource('{proxy+}')
    .addMethod(HttpMethod.GET, new LambdaIntegration(lambdaFunction))
}

const EVENTS_BUCKET_GITHUB_WEBHOOK_KEY_PREFIX = 'githubWebhook/'

function defineWebhook(scope: Construct, props: GithubInteractionProps, githubApiResource: Resource) {
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

  githubApiResource
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
