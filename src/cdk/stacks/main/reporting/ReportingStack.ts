import { AllStacksProps } from '../../../config/allStacksProps'
import { Construct } from 'constructs'
import { NestedStack } from 'aws-cdk-lib'
import { createReportingStackProps } from './reportingStackProps'
import { defineRepoActivityDynamoDBStreamFanOut } from './streamFanOut'

export class ReportingStack extends NestedStack {
  constructor(scope: Construct, id: string, allStacksProps: AllStacksProps) {
    super(scope, id)

    const props = createReportingStackProps(this, allStacksProps)

    // DynamoDB streams can only have one or two listeners. We'll eventually want
    // several processors for the activity table, so fan out DynamoDB Stream events to EventBridge
    defineRepoActivityDynamoDBStreamFanOut(this, props)
  }
}
