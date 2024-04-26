import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { defineUserFacingWebEndpoints } from './userFacingWeb'
import { AllStacksProps } from '../../config/allStacksProps'
import { createMainStackProps } from './mainStackProps'
import { defineWebInfrastructure } from './webInfrastructure'
import { defineGithubInteraction } from './githubInteraction'
import { saveInSSMViaCloudFormation } from '../../support/ssm'
import { SSM_PARAM_NAMES, SsmParamName } from '../../../multipleContexts/ssmParams'
import { defineGithubCrawlers } from './githubCrawlers'

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

    defineGithubCrawlers(this, mainStackProps)

    savePreGeneratedConfiguration(this, props)
  }
}

function savePreGeneratedConfiguration(scope: Construct, props: AllStacksProps) {
  function saveSSM(key: SsmParamName, value: string) {
    saveInSSMViaCloudFormation(scope, props, key, value)
  }

  saveSSM(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY, props.webPushConfig.publicKey)
  saveSSM(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY, props.webPushConfig.privateKey)
  saveSSM(SSM_PARAM_NAMES.WEB_PUSH_SUBJECT, props.webPushConfig.subject)
  saveSSM(SSM_PARAM_NAMES.GITHUB_CALLBACK_STATE, props.randomizedValues.githubCallbackState)
  saveSSM(SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE, props.randomizedValues.githubWebhookURLCode)
}
