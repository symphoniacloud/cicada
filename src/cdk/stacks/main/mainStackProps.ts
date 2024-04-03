import { Construct } from 'constructs'
import { AllStacksProps } from '../../config/allStacksProps'
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3'
import { readFromSSMViaCloudFormation } from '../../support/ssm'
import { SSM_PARAM_NAMES, ssmTableNamePath } from '../../../multipleContexts/ssmParams'
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
  certificate: ICertificate
  zone: IHostedZone
}

export function createMainStackProps(scope: Construct, props: AllStacksProps): MainStackProps {
  return {
    ...props,
    allTables: lookupTables(scope, props),
    eventsBucket: Bucket.fromBucketName(
      scope,
      'EventsBucket',
      readFromSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.EVENTS_BUCKET_NAME)
    ),
    certificate: Certificate.fromCertificateArn(
      scope,
      'StandardCertificate',
      Fn.importValue(props.web.certificateArnCloudformationExport)
    ),
    zone: HostedZone.fromLookup(scope, 'AccountZone', { domainName: props.web.parentDomainName })
  }
}

function lookupTables(scope: Construct, props: AllStacksProps): Record<CicadaTableId, ITableV2> {
  function lookupTable(tableId: CicadaTableId) {
    return TableV2.fromTableAttributes(scope, `${tableId}-table`, {
      tableName: readFromSSMViaCloudFormation(scope, props, ssmTableNamePath(tableId)),
      grantIndexPermissions: tableConfigurations[tableId].hasGSI1
    })
  }

  // Typescript question - any way to do this without the typecasting with 'as' ?
  return Object.fromEntries(CICADA_TABLE_IDS.map((id) => [id, lookupTable(id)])) as Record<
    CicadaTableId,
    ITableV2
  >
}
