import { WithAppName } from '../config/allStacksProps'
import { EnvironmentSettings } from '../config/environmentSettings'
import { IBucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { CustomResource, Stack } from 'aws-cdk-lib'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'
import { Provider } from 'aws-cdk-lib/custom-resources'
import { CicadaCDKCustomResourceFunction } from './CicadaCDKCustomResourceFunction'
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam'

export interface AthenaMigrationsProps extends WithAppName, EnvironmentSettings {
  glueDatabaseName: string
  tableBucket: IBucket
  athenaBucket: IBucket
  workGroupName: string
}

export class AthenaMigrations extends Construct {
  constructor(scope: Construct, id: string, props: AthenaMigrationsProps) {
    super(scope, id)

    const migrationsScripts = new Asset(this, 'MigrationsScripts', {
      path: '../migrations/athena'
    })

    new CustomResource(this, 'Resource', {
      serviceToken: getOrCreateAthenaMigrationsProvider(this, props, migrationsScripts),
      resourceType: 'Custom::AthenaMigrations',
      removalPolicy: props.storageResourceRemovalPolicy,
      properties: {
        MigrationsBucketName: migrationsScripts.s3BucketName,
        MigrationsKey: migrationsScripts.s3ObjectKey,
        DatabaseName: props.glueDatabaseName,
        TableBucketName: props.tableBucket.bucketName,
        WorkGroupName: props.workGroupName
      }
    })
  }
}

const SINGLETON_ID = 'io.symphonia.cicada.cdk.custom-resources.athena-migrations-provider'

function getOrCreateAthenaMigrationsProvider(
  scope: Construct,
  props: AthenaMigrationsProps,
  migrationsScripts: Asset
) {
  return (
    (scope.node.tryFindChild(SINGLETON_ID) as AthenaMigrationsProvider) ??
    new AthenaMigrationsProvider(Stack.of(scope), SINGLETON_ID, props, migrationsScripts)
  ).provider.serviceToken
}

export class AthenaMigrationsProvider extends Construct {
  readonly provider: Provider

  constructor(scope: Construct, id: string, props: AthenaMigrationsProps, migrationsScripts: Asset) {
    super(scope, id)

    this.provider = defineProvider(this, props, migrationsScripts)
  }
}

function defineProvider(scope: Construct, props: AthenaMigrationsProps, migrationsScripts: Asset) {
  const onEventHandler = new CicadaCDKCustomResourceFunction(scope, {
    ...props,
    functionName: 'athenaMigrations',
    timeoutSeconds: 60
  })
  onEventHandler.role?.addManagedPolicy(
    ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSQuicksightAthenaAccess')
  )
  props.tableBucket.grantReadWrite(onEventHandler)
  props.athenaBucket.grantReadWrite(onEventHandler)
  migrationsScripts.grantRead(onEventHandler)

  return new Provider(scope, 'athena-migrations-provider', {
    onEventHandler,
    logRetention: props.logRetention
  })
}
