import { Effect, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam'
import { FunctionBase } from 'aws-cdk-lib/aws-lambda/lib/function-base'
import { WithEnvironment } from '../config/allStacksProps'

export function grantLambdaFunctionPermissionToPutEvents(
  lambdaFunction: FunctionBase,
  props: WithEnvironment
) {
  lambdaFunction.addToRolePolicy(allowPutEventsPolicy(props))
}

export function grantRolePermissionToPutEvents(role: Role, props: WithEnvironment) {
  role.addToPolicy(allowPutEventsPolicy(props))
}

function allowPutEventsPolicy(props: WithEnvironment) {
  return new PolicyStatement({
    effect: Effect.ALLOW,
    resources: [eventbridgeDefaultBusArn(props)],
    actions: ['events:PutEvents']
  })
}

export function eventbridgeDefaultBusArn(props: WithEnvironment) {
  return `arn:aws:events:${props.env.region}:${props.env.account}:event-bus/default`
}
