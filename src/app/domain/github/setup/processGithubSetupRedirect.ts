import { Route } from '../../../internalHttpRouter/internalHttpRoute'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { GithubSetupAppState } from './githubSetupAppState'
import { pageViewResponse } from '../../../web/viewResultWrappers'
import { Octokit } from '@octokit/rest'
import { ParameterType, PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import {
  createFullParameterName,
  SSM_PARAM_NAMES,
  SsmParamName
} from '../../../../multipleContexts/ssmParams'
import { logger } from '../../../util/logging'
import { fromRawAccountType, ORGANIZATION_ACCOUNT_TYPE } from '../../types/GithubAccountType'
import { a, p } from '../../../web/hiccough/hiccoughElements'
import { fromRawGithubAppId, GithubAppId } from '../../types/GithubAppId'

export const setupRedirectRoute: Route<APIGatewayProxyEvent, GithubSetupAppState> = {
  path: '/github/setup/redirect',
  target: setupRedirectHandler
}

async function setupRedirectHandler(appState: GithubSetupAppState, event: APIGatewayProxyEvent) {
  return processRedirect(appState, event)
}

async function processRedirect(appState: GithubSetupAppState, event: APIGatewayProxyEvent) {
  const code = event.queryStringParameters?.['code']
  if (!code) return noCodeResponse

  const state = event.queryStringParameters?.['state']
  if (!state) return noStateResponse

  if (state !== appState.callbackState) return invalidStateResponse

  // TODO - error handling
  const appDetails = await callGithubToFinishAppCreation(code)

  await saveGithubAppConfiguration(appState.appName, appDetails)

  const installationsPath =
    appDetails.accountType === ORGANIZATION_ACCOUNT_TYPE
      ? `https://github.com/organizations/${appDetails.accountLogin}/settings/apps/${appDetails.appName}/installations`
      : `https://github.com/settings/apps/${appDetails.appName}/installations`

  return pageViewResponse(
    [
      p(
        `Github app ${appDetails.appName} has been successsfully created. You now need to install it in GitHub `,
        a(installationsPath, 'here'),
        `Once you've installed the GitHub app Cicada will start loading your GitHub data - <b>this can take a minute or more</b>`
      )
    ],
    { loggedIn: false }
  )
}

export async function callGithubToFinishAppCreation(code: string): Promise<{
  appId: GithubAppId
  appName: string
  clientId: string
  clientSecret: string
  privateKey: string
  webhookSecret: string
  accountLogin: string
  accountType: string
}> {
  const result = await new Octokit().apps.createFromManifest({ code })
  if (!result.data.webhook_secret) throw new Error("GitHub didn't return webhook secret")
  if (!result.data.owner) throw new Error("GitHub didn't return owner")

  return {
    appId: fromRawGithubAppId(result.data.id),
    appName: result.data.name,
    clientId: result.data.client_id,
    clientSecret: result.data.client_secret,
    privateKey: result.data.pem,
    webhookSecret: result.data.webhook_secret,
    accountLogin: result.data.owner.login,
    accountType: fromRawAccountType(result.data.owner.type)
  }
}

const ssmClient = new SSMClient()

async function saveGithubAppConfiguration(
  appName: string,
  {
    appId,
    clientId,
    clientSecret,
    privateKey,
    webhookSecret
  }: {
    appId: GithubAppId
    clientId: string
    clientSecret: string
    privateKey: string
    webhookSecret: string
  }
) {
  await writeSSMParameter(appName, SSM_PARAM_NAMES.GITHUB_APP_ID, appId)
  await writeSSMParameter(appName, SSM_PARAM_NAMES.GITHUB_CLIENT_ID, clientId)
  await writeSSMParameter(
    appName,
    SSM_PARAM_NAMES.GITHUB_CLIENT_SECRET,
    clientSecret,
    ParameterType.SECURE_STRING
  )
  await writeSSMParameter(
    appName,
    SSM_PARAM_NAMES.GITHUB_PRIVATE_KEY,
    privateKey,
    ParameterType.SECURE_STRING
  )
  await writeSSMParameter(
    appName,
    SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET,
    webhookSecret,
    ParameterType.SECURE_STRING
  )
}

async function writeSSMParameter(
  appName: string,
  key: SsmParamName,
  value: string,
  type: ParameterType = ParameterType.STRING
) {
  const name = createFullParameterName({ appName }, key)
  logger.debug(`Saving Secret SSM Parameter ${name}`)
  await ssmClient.send(
    new PutParameterCommand({
      Name: name,
      Value: value,
      Type: type,
      Overwrite: true
    })
  )
}

const noCodeResponse = pageViewResponse([p('Unexpected redirect from GitHub - no code on URL')], {
  loggedIn: false
})

const noStateResponse = pageViewResponse([p('Unexpected redirect from GitHub - no state on URL')], {
  loggedIn: false
})

const invalidStateResponse = pageViewResponse([p('Unexpected redirect from GitHub - invalid state on URL')], {
  loggedIn: false
})
