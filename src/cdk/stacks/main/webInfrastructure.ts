import { Construct } from 'constructs'
import { BlockPublicAccess, Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { AccessLogFormat, EndpointType, LogGroupLogDestination, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  Distribution,
  HttpVersion,
  OriginRequestPolicy,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront'
import { saveInSSMViaCloudFormation } from '../../support/ssm'
import { SSM_PARAM_NAMES } from '../../../multipleContexts/ssmParams'
import { MainStackProps } from './mainStackProps'

export function defineWebInfrastructure(scope: Construct, props: MainStackProps) {
  const { apiDomainName, apiPath, restApi } = defineRestApiGateway(scope, props)
  const websiteBucket = defineWebsiteBucket(scope, props)
  defineCloudfront(scope, props, websiteBucket, apiDomainName, apiPath)
  return { restApi }
}

function defineRestApiGateway(scope: Construct, props: MainStackProps) {
  const parentDomainName = props.web.parentDomainName

  const restApi = new RestApi(scope, 'RestApi', {
    restApiName: `${props.appName}-rest`,
    endpointTypes: [EndpointType.REGIONAL],
    deployOptions: {
      tracingEnabled: true,
      accessLogDestination: new LogGroupLogDestination(
        new LogGroup(scope, 'RestApiAccessLogs', {
          logGroupName: `/aws/apigateway/${props.appName}-rest`,
          removalPolicy: props.storageResourceRemovalPolicy
        })
      ),
      accessLogFormat: AccessLogFormat.custom(
        '{"requestTime":"$context.requestTime","requestId":"$context.requestId","httpMethod":"$context.httpMethod","path":"$context.path","resourcePath":"$context.resourcePath","status":$context.status,"responseLatency":$context.responseLatency}'
      )
    },
    defaultCorsPreflightOptions: {
      allowHeaders: ['*'],
      allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.HEAD, CorsHttpMethod.OPTIONS, CorsHttpMethod.POST],
      // TOEventually - reconsider origins here
      allowOrigins: [
        'http://localhost:9000',
        ...(parentDomainName ? [`https://${props.appName}.${parentDomainName}`] : [])
      ],
      allowCredentials: true,
      maxAge: Duration.days(10)
    }
  })

  return {
    apiDomainName: `${restApi.restApiId}.execute-api.${props.env.region}.amazonaws.com`,
    apiPath: `/${restApi.deploymentStage.stageName}`,
    restApi
  }
}

function defineWebsiteBucket(scope: Construct, props: MainStackProps) {
  const websiteBucket = new Bucket(scope, 'WebsiteBucket', {
    objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    autoDeleteObjects: true,

    // Can always delete this bucket - it's just generated from web source files
    removalPolicy: RemovalPolicy.DESTROY
  })

  new BucketDeployment(scope, 'DeployWebsite', {
    sources: [Source.asset('../../build/web')],
    destinationBucket: websiteBucket,
    logRetention: props.logRetention
  })

  // Used in deploy script
  new CfnOutput(scope, 'WebsiteBucketName', { value: websiteBucket.bucketName })
  return websiteBucket
}

function defineCloudfront(
  scope: Construct,
  props: MainStackProps,
  websiteBucket: Bucket,
  apiDomainName: string,
  apiPath: string
) {
  const apiOrigin = new HttpOrigin(apiDomainName, { originPath: apiPath })
  const apiGatewayBehavior: BehaviorOptions = {
    origin: apiOrigin,
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: AllowedMethods.ALLOW_ALL,
    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
    // TOEventually consider actually adding a cache, but also consider Github Webhook with headers (may need sep behavior)
    cachePolicy: CachePolicy.CACHING_DISABLED
  }

  const parentDomainName = props.web.parentDomainName
  const zone = props.zone
  const certificate = props.certificate
  const fullCustomHostName =
    parentDomainName && zone && certificate ? `${props.appName}.${parentDomainName}` : undefined

  const cloudfront = new Distribution(scope, 'Cloudfront', {
    defaultRootObject: 'index.html',
    httpVersion: HttpVersion.HTTP2_AND_3,
    defaultBehavior: {
      origin: new S3Origin(websiteBucket),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      // TOEventually - eventually will want caching enabled but with a default cache time
      cachePolicy: CachePolicy.CACHING_DISABLED
    },
    additionalBehaviors: {
      // TOEventually - would be nice to put these paths on the sub-modules
      'github/*': apiGatewayBehavior,
      'app/*': apiGatewayBehavior,
      'apia/*': apiGatewayBehavior
    },
    ...(fullCustomHostName ? { domainNames: [fullCustomHostName] } : {}),
    ...(fullCustomHostName && certificate ? { certificate } : {})
  })

  const webHostname = fullCustomHostName ? fullCustomHostName : cloudfront.distributionDomainName
  saveInSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.WEB_HOSTNAME, webHostname)
  new CfnOutput(scope, 'CicadaHomePage', { value: `https://${webHostname}` })

  if (zone && fullCustomHostName) {
    new ARecord(scope, 'CloudfrontDNSRecord', {
      zone,
      recordName: fullCustomHostName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfront)),
      ttl: Duration.minutes(5)
    })
  }
}
