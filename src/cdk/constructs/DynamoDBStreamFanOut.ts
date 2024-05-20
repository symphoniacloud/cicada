import { Construct } from 'constructs'
import { ITable } from 'aws-cdk-lib/aws-dynamodb'
import { eventbridgeDefaultBusArn, grantRolePermissionToPutEvents } from '../support/eventbridge'
import { CfnPipe } from 'aws-cdk-lib/aws-pipes'
import { throwFunction } from '../../multipleContexts/errors'
import { EventBridgePipe, EventBridgePipeProps } from './EventBridgePipe'
import PipeTargetEventBridgeEventBusParametersProperty = CfnPipe.PipeTargetEventBridgeEventBusParametersProperty
import PipeSourceDynamoDBStreamParametersProperty = CfnPipe.PipeSourceDynamoDBStreamParametersProperty

import { WithEnvironment } from '../config/allStacksProps'

interface DynamoDBStreamFanOutProps
  extends WithEnvironment,
    Omit<EventBridgePipeProps, 'source' | 'sourceParameters' | 'target' | 'targetParameters'> {
  readonly table: ITable
  readonly streamProperties: PipeSourceDynamoDBStreamParametersProperty
  readonly eventBridgeProperties: PipeTargetEventBridgeEventBusParametersProperty
}

export class DynamoDBStreamFanOut extends EventBridgePipe {
  constructor(scope: Construct, id: string, props: DynamoDBStreamFanOutProps) {
    super(scope, id, {
      ...props,
      source: props.table.tableStreamArn ?? throwFunction('No stream on table')(),
      sourceParameters: {
        dynamoDbStreamParameters: props.streamProperties
      },
      target: eventbridgeDefaultBusArn(props),
      targetParameters: {
        eventBridgeEventBusParameters: props.eventBridgeProperties
      }
    })

    props.table.grantStreamRead(this.role)
    grantRolePermissionToPutEvents(this.role, props)
  }
}
