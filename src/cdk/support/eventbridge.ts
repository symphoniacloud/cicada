import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { AllStacksProps } from '../config/allStacksProps'
import { FunctionBase } from 'aws-cdk-lib/aws-lambda/lib/function-base'

export function grantLambdaFunctionPermissionToPutEvents(
  lambdaFunction: FunctionBase,
  props: AllStacksProps
) {
  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [`arn:aws:events:${props.env.region}:${props.env.account}:event-bus/default`],
      actions: ['events:PutEvents']
    })
  )
}
