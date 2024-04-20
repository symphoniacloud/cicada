import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { defineUserFacingWebEndpoints } from './userFacingWeb'
import { AllStacksProps } from '../../config/allStacksProps'
import { createMainStackProps } from './mainStackProps'
import { defineWebInfrastructure } from './webInfrastructure'
import { defineGithubInteraction } from './githubInteraction'
import { saveInSSMViaCloudFormation } from '../../support/ssm'
import { SSM_PARAM_NAMES } from '../../../multipleContexts/ssmParams'

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: AllStacksProps) {
    super(scope, id, props)

    const mainStackProps = createMainStackProps(this, props)

    const { restApi } = defineWebInfrastructure(this, mainStackProps)

    defineUserFacingWebEndpoints(this, {
      ...mainStackProps,
      restApi
    })

    defineGithubInteraction(this, {
      ...mainStackProps,
      restApi
    })

    savePreGeneratedConfiguration(this, props)
  }
}

function savePreGeneratedConfiguration(scope: Construct, props: AllStacksProps) {
  saveInSSMViaCloudFormation(
    scope,
    props,
    SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY,
    props.webPushConfig.publicKey
  )
  saveInSSMViaCloudFormation(
    scope,
    props,
    SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY,
    props.webPushConfig.privateKey
  )
  saveInSSMViaCloudFormation(scope, props, SSM_PARAM_NAMES.WEB_PUSH_SUBJECT, props.webPushConfig.subject)
}
