import { NamingProps, resourceName } from './constructSupport'
import { Construct } from 'constructs'
import { CfnPipe } from 'aws-cdk-lib/aws-pipes'
import { CfnPipeProps } from 'aws-cdk-lib/aws-pipes/lib/pipes.generated'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { LogGroupProps } from 'aws-cdk-lib/aws-logs/lib/log-group'
import { Optional } from '../../../../app/util/types'

import { WithEnvironment } from '../../../config/allStacksProps'

export interface EventBridgePipeProps
  extends WithEnvironment,
    NamingProps,
    Optional<CfnPipeProps, 'roleArn'> {
  // Defaults to no logging
  readonly log?: {
    // defaults to error, if parent 'log' property defined
    readonly level?: 'OFF' | 'ERROR' | 'INFO' | 'TRACE'
    readonly logGroupProps?: LogGroupProps
  }
}

export class EventBridgePipe extends Construct {
  readonly role: Role
  readonly pipe: CfnPipe

  constructor(scope: Construct, id: string, props: EventBridgePipeProps) {
    super(scope, id)

    const logGroup = defineLogGroup(this, props)
    this.role = defineRole(this, logGroup)
    this.pipe = definePipe(this, props, logGroup, this.role)
  }
}

function defineLogGroup(scope: Construct, props: EventBridgePipeProps) {
  if (!props.log) return undefined

  return new LogGroup(scope, 'LogGroup', {
    logGroupName: resourceName(props),
    ...props.log.logGroupProps
  })
}

function defineRole(scope: Construct, logGroup: undefined | LogGroup) {
  const role = new Role(scope, `Role`, {
    assumedBy: new ServicePrincipal('pipes.amazonaws.com')
  })
  if (logGroup) logGroup.grantWrite(role)
  return role
}

function definePipe(
  scope: Construct,
  props: EventBridgePipeProps,
  logGroup: undefined | LogGroup,
  role: Role
) {
  // No stable L2 construct available at time of writing
  return new CfnPipe(scope, 'Pipe', {
    name: resourceName(props),
    roleArn: role.roleArn,
    ...(logGroup
      ? {
          logConfiguration: {
            level: props.log?.level ?? 'ERROR',
            cloudwatchLogsLogDestination: {
              logGroupArn: logGroup.logGroupArn
            }
          }
        }
      : undefined),
    ...props
  })
}
