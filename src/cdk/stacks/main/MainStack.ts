import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { defineUserFacingWebEndpoints } from './userFacingWeb'
import { AllStacksProps } from '../../config/allStacksProps'
import { createMainStackProps } from './mainStackProps'
import { defineWebInfrastructure } from './webInfrastructure'
import { defineGithubInteraction } from './githubInteraction'

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
  }
}
