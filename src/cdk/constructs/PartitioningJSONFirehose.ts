import { NamingProps, resourceName } from './constructSupport'
import { Construct } from 'constructs'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose'
import { IBucket } from 'aws-cdk-lib/aws-s3'
import { WithEnvironment } from '../config/allStacksProps'

export interface PartitioningJSONFirehoseProps extends WithEnvironment, NamingProps {
  readonly bucket: IBucket
  readonly metadataExtractionParameterValue: string
  readonly prefix: string
  readonly errorOutputPrefix: string
}

export class PartitioningJSONFirehose extends Construct {
  readonly role: Role
  readonly firehose: CfnDeliveryStream

  constructor(scope: Construct, id: string, props: PartitioningJSONFirehoseProps) {
    super(scope, id)

    this.role = defineRole(this, props)
    this.firehose = defineFirehose(this, props, this.role)
  }
}

function defineRole(scope: Construct, props: PartitioningJSONFirehoseProps) {
  const role = new Role(scope, 'Role', {
    assumedBy: new ServicePrincipal('firehose.amazonaws.com')
  })
  props.bucket.grantReadWrite(role)
  return role
}

function defineFirehose(scope: Construct, props: PartitioningJSONFirehoseProps, role: Role) {
  // TODO - logging
  // Eventually make more of this configurable, as necessary
  return new CfnDeliveryStream(scope, `Firehose`, {
    deliveryStreamName: resourceName(props),
    extendedS3DestinationConfiguration: {
      bucketArn: props.bucket.bucketArn,
      roleArn: role.roleArn,
      dynamicPartitioningConfiguration: {
        enabled: true,
        retryOptions: {
          durationInSeconds: 120
        }
      },
      processingConfiguration: {
        enabled: true,
        processors: [
          {
            type: 'RecordDeAggregation',
            parameters: [
              {
                parameterName: 'SubRecordType',
                parameterValue: 'JSON'
              }
            ]
          },
          {
            type: 'MetadataExtraction',
            parameters: [
              {
                parameterName: 'MetadataExtractionQuery',
                parameterValue: props.metadataExtractionParameterValue
              },
              {
                parameterName: 'JsonParsingEngine',
                parameterValue: 'JQ-1.6'
              }
            ]
          },
          {
            type: 'AppendDelimiterToRecord',
            parameters: [
              {
                parameterName: 'Delimiter',
                parameterValue: '\\n'
              }
            ]
          }
        ]
      },
      prefix: props.prefix,

      compressionFormat: 'GZIP',
      bufferingHints: {
        intervalInSeconds: 60,
        // minimum for dynamic partitioning
        sizeInMBs: 64
      },
      errorOutputPrefix: props.errorOutputPrefix
    }
  })
}
