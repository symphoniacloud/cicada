import { Construct } from 'constructs'
import { CicadaFunction, cicadaFunctionProps } from '../../constructs/CicadaFunction.js'
import { Duration } from 'aws-cdk-lib'
import { grantLambdaFunctionPermissionToPutEvents } from '../../support/eventbridge.js'
import { Rule } from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import { IdentitySource, LambdaIntegration, RequestAuthorizer, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { MainStackProps } from './mainStackProps.js'
import {
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH,
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
  EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST
} from '../../../multipleContexts/eventBridgeSchemas.js'

export interface UserFacingWebEndpointsProps extends MainStackProps {
  readonly restApi: RestApi
}

export function defineUserFacingWebEndpoints(scope: Construct, props: UserFacingWebEndpointsProps) {
  defineAuthenticatedWeb(scope, props)
  defineAuthenticatedApi(scope, props)
  defineWebPushPublisher(scope, props)
}

function defineAuthorizer(scope: Construct, props: UserFacingWebEndpointsProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'apiGatewayAuthorizer', {
      timeoutSeconds: 10,
      tablesReadAccess: ['github-users', 'github-account-memberships'],
      tablesReadWriteAccess: ['github-user-tokens']
    })
  )
  return new RequestAuthorizer(scope, 'RestRequestAuthorizer', {
    handler: lambdaFunction,
    identitySources: [IdentitySource.header('Cookie')],
    // TOEventually - enable caching
    resultsCacheTtl: Duration.seconds(0)
  })
}

function defineAuthenticatedWeb(scope: Construct, props: UserFacingWebEndpointsProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'authenticatedWeb', {
      tablesReadAccess: [
        'github-installations',
        'github-users',
        'github-account-memberships',
        'github-repositories',
        'github-workflows',
        'github-latest-workflow-runs',
        'github-latest-pushes-per-ref',
        'github-repo-activity'
      ],
      tablesReadWriteAccess: ['github-user-tokens', 'user-settings', 'github-public-accounts']
    })
  )
  grantLambdaFunctionPermissionToPutEvents(lambdaFunction, props)
  props.restApi.root
    .addResource('app')
    .addResource('{proxy+}')
    .addMethod(HttpMethod.ANY, new LambdaIntegration(lambdaFunction))
}

function defineAuthenticatedApi(scope: Construct, props: UserFacingWebEndpointsProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'authenticatedApi', {
      tablesReadWriteAccess: ['web-push-subscriptions']
    })
  )
  grantLambdaFunctionPermissionToPutEvents(lambdaFunction, props)

  const resource = props.restApi.root.addResource('apia').addResource('{proxy+}')
  const authorizer = defineAuthorizer(scope, props)
  resource.addMethod(HttpMethod.GET, new LambdaIntegration(lambdaFunction), {
    authorizer
  })
  resource.addMethod(HttpMethod.POST, new LambdaIntegration(lambdaFunction), {
    authorizer
  })
}

function defineWebPushPublisher(scope: Construct, props: UserFacingWebEndpointsProps) {
  const lambdaFunction = new CicadaFunction(
    scope,
    cicadaFunctionProps(props, 'webPushPublisher', {
      tablesReadAccess: [
        'github-installations',
        'github-public-accounts',
        'github-users',
        'github-account-memberships',
        'user-settings',
        'web-push-subscriptions',
        'github-repositories',
        'github-workflows',
        'github-latest-workflow-runs',
        'github-latest-pushes-per-ref',
        'github-repo-activity'
      ]
    })
  )
  new Rule(scope, 'WebPushPublisherRule', {
    description: `Send Web Push notifications`,
    eventPattern: {
      source: [props.appName],
      // Need Array.from here otherwise a type error
      detailType: Array.from([
        EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH,
        EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
        EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST
      ])
    },
    targets: [new targets.LambdaFunction(lambdaFunction)]
  })
}
