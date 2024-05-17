import { AllStacksProps } from '../../../config/allStacksProps'
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { lookupTable } from '../mainStackProps'

export interface ReportingStackProps extends AllStacksProps {
  githubRepoActivityTable: ITableV2
}

export function createReportingStackProps(scope: Construct, props: AllStacksProps): ReportingStackProps {
  return {
    ...props,
    githubRepoActivityTable: lookupTable(scope, props, 'github-repo-activity')
  }
}
