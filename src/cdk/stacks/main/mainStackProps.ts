import { Construct } from 'constructs'
import { AllStacksProps } from '../../config/allStacksProps'
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3'
import { readFromSSMViaCloudFormation } from '../../support/ssm'
import { SSM_PARAM_NAMES, ssmTableNamePath, ssmTableStreamPath } from '../../../multipleContexts/ssmParams'
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { Fn } from 'aws-cdk-lib'
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53'
import {
  CICADA_TABLE_IDS,
  CicadaTableId,
  tableConfigurations
} from '../../../multipleContexts/dynamoDBTables'
import { ITableV2, TableV2 } from 'aws-cdk-lib/aws-dynamodb'

export interface MainStackProps extends AllStacksProps {
  allTables: Record<CicadaTableId, ITableV2>
  eventsBucket: IBucket
  certificate?: ICertificate
  zone?: IHostedZone
}

function locateCertificate(scope: Construct, props: AllStacksProps) {
  const { certificateArn, certificateArnCloudformationExport: certificateExport } = props.web
  const arn = certificateArn
    ? certificateArn
    : certificateExport
    ? Fn.importValue(certificateExport)
    : undefined
  return arn ? Certificate.fromCertificateArn(scope, 'StandardCertificate', arn) : undefined
}

export function createMainStackProps(scope: Construct, props: AllStacksProps): MainStackProps {
  const parentDomainName = props.web.parentDomainName
  const certificate = locateCertificate(scope, props)

  return {
    ...props,
    allTables: lookupTables(scope, props),
    eventsBucket: lookupBucket(scope, props, 'EventsBucket', SSM_PARAM_NAMES.EVENTS_BUCKET_NAME),
    ...(certificate
      ? {
          certificate
        }
      : {}),
    ...(parentDomainName
      ? { zone: HostedZone.fromLookup(scope, 'AccountZone', { domainName: parentDomainName }) }
      : {})
  }
}

function lookupTables(scope: Construct, props: AllStacksProps): Record<CicadaTableId, ITableV2> {
  // Typescript question - any way to do this without the typecasting with 'as' ?
  return Object.fromEntries(CICADA_TABLE_IDS.map((id) => [id, lookupTable(scope, props, id)])) as Record<
    CicadaTableId,
    ITableV2
  >
}

// also used by reporting stack props
export function lookupBucket(scope: Construct, props: AllStacksProps, id: string, key: string) {
  return Bucket.fromBucketName(scope, id, readFromSSMViaCloudFormation(scope, props, key))
}

export function lookupBucketFromName(scope: Construct, id: string, name: string) {
  return Bucket.fromBucketName(scope, id, name)
}

// also used by reporting stack props
export function lookupTable(scope: Construct, props: AllStacksProps, tableId: CicadaTableId) {
  const config = tableConfigurations[tableId]
  return TableV2.fromTableAttributes(scope, `${tableId}-table`, {
    tableName: readFromSSMViaCloudFormation(scope, props, ssmTableNamePath(tableId)),
    grantIndexPermissions: config.hasGSI1,
    ...(config.stream
      ? {
          tableStreamArn: readFromSSMViaCloudFormation(scope, props, ssmTableStreamPath(tableId))
        }
      : {})
  })
}
