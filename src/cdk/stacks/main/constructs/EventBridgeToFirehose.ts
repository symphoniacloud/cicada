import { EventBridgePipe, EventBridgePipeProps } from './EventBridgePipe'
import { Construct } from 'constructs'
import { CfnPipe } from 'aws-cdk-lib/aws-pipes'
import { PolicyStatement, Role } from 'aws-cdk-lib/aws-iam'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Duration } from 'aws-cdk-lib'
import { Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { resourceName } from './constructSupport'
import { EventPattern } from 'aws-cdk-lib/aws-events/lib/event-pattern'
import { Optional } from '../../../../app/util/types'

export interface EventBridgeToFirehoseProps
  extends Optional<EventBridgePipeProps, 'source' | 'sourceParameters' | 'target' | 'targetParameters'> {
  eventPattern: EventPattern
  firehoseArn: string
}

export class EventBridgeToFirehose extends Construct {
  readonly pipe: CfnPipe
  readonly role: Role

  constructor(scope: Construct, id: string, props: EventBridgeToFirehoseProps) {
    super(scope, id)
    // At current time EventBridgePipe can't directly input from EventBridge,
    // therefore it's necessary to create an SQS queue as an intermediary
    const inputQueue = defineInputRuleAndQueue(this, props)

    const pipeAndRole = new EventBridgePipe(this, 'Pipe', {
      ...props,
      source: inputQueue.queueArn,
      target: props.firehoseArn
    })

    this.pipe = pipeAndRole.pipe
    this.role = pipeAndRole.role

    inputQueue.grantConsumeMessages(this.role)
    this.role.addToPolicy(
      new PolicyStatement({
        actions: ['firehose:PutRecord', 'firehose:PutRecordBatch'],
        resources: [props.firehoseArn]
      })
    )
  }
}

function defineInputRuleAndQueue(scope: Construct, props: EventBridgeToFirehoseProps) {
  const inputQueue = new Queue(scope, `InputQueue`, {
    queueName: resourceName({ resource: 'input-queue', ...props }),
    deadLetterQueue: {
      queue: new Queue(scope, `InputDLQ`, {
        queueName: resourceName({ resource: 'input-dlq', ...props }),
        // TODO - make configurable
        retentionPeriod: Duration.days(7)
      }),
      // TODO - make configurable
      maxReceiveCount: 5
    }
  })
  new Rule(scope, 'ToInputQueueRule', {
    eventPattern: props.eventPattern,
    targets: [new SqsQueue(inputQueue)]
  })
  return inputQueue
}
