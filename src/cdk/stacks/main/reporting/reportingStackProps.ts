import { AllStacksProps } from '../../../config/allStacksProps'
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { lookupBucket, lookupTable } from '../mainStackProps'
import { IBucket } from 'aws-cdk-lib/aws-s3'
import { SSM_PARAM_NAMES } from '../../../../multipleContexts/ssmParams'
import { readFromSSMViaCloudFormation } from '../../../support/ssm'

export interface ReportingStackProps extends AllStacksProps {
  githubRepoActivityTable: ITableV2
  reportingIngestionBucket: IBucket
  glueDatabaseName: string
  athenaOutputBucket: IBucket
  athenaWorkgroupName: string
}

export function createReportingStackProps(scope: Construct, props: AllStacksProps): ReportingStackProps {
  return {
    ...props,
    githubRepoActivityTable: lookupTable(scope, props, 'github-repo-activity'),
    reportingIngestionBucket: lookupBucket(
      scope,
      props,
      'ReportingIngestionBucket',
      SSM_PARAM_NAMES.REPORTING_INGESTION_BUCKET_NAME
    ),
    glueDatabaseName: readFromSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.GLUE_DATABASE_NAME),
    athenaOutputBucket: lookupBucket(
      scope,
      props,
      'AthenaOutputBucket',
      SSM_PARAM_NAMES.ATHENA_OUTPUT_BUCKET_NAME
    ),
    athenaWorkgroupName: readFromSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.ATHENA_WORKGROUP_NAME)
  }
}
