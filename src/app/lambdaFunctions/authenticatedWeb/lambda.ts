import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import { helloPageRoute } from '../../web/pages/helloPage'
import { CicadaAPIAuthorizedAPIHandler } from '../../inboundInterfaces/lambdaTypes'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { logoutResponse } from '../../domain/github/githubUserAuth/githubWebAuthHandler'
import { authorizeUserRequest } from '../../domain/webAuth/userAuthorizer'
import { notAuthorizedHTMLResponse } from '../../web/htmlResponses'
import { logger } from '../../util/logging'
import { pageViewResponse } from '../../web/viewResultWrappers'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup'
import { isFailure } from '../../util/structuredResult'
import { a, p } from '../../web/hiccough/hiccoughElements'
import { repoHeadingFragmentRoute } from '../../web/fragments/repoHeading'
import { actionsStatusFragmentRoute } from '../../web/fragments/actionsStatus'
import { gitHubActivityFragmentRoute } from '../../web/fragments/gitHubActivity'
import { workflowHeadingFragmentRoute } from '../../web/fragments/workflowHeading'
import { getUserSettingsFragmentRoute } from '../../web/fragments/getUserSettings'
import { postUserSettingFragmentRoute } from '../../web/fragments/postUserSetting'
import { postResetUserSettingsFragmentRoute } from '../../web/fragments/postResetUserSettings'
import { adminPageRoute } from '../../web/pages/adminPage'
import { adminAddPublicAccountPageRoute } from '../../web/pages/adminAddPublicAccountPage'

const router = createRouter([
  repoHeadingFragmentRoute,
  workflowHeadingFragmentRoute,
  actionsStatusFragmentRoute,
  gitHubActivityFragmentRoute,
  getUserSettingsFragmentRoute,
  postUserSettingFragmentRoute,
  postResetUserSettingsFragmentRoute,
  adminPageRoute,
  helloPageRoute,
  adminAddPublicAccountPageRoute
])

let appState: AppState

export const baseHandler: CicadaAPIAuthorizedAPIHandler = async (event: APIGatewayProxyEvent) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.info('Github App not ready, returning boilerplate page')
      return setupRequiredResponse
    }

    appState = startup.result
  }

  return await handleWebRequest(appState, event)
}

export const setupRequiredResponse = pageViewResponse([
  p('Cicada GitHub app not ready yet.', a(startSetupRoute.path, 'Go here to start the setup process'))
])

// TOEventually - top level error handler
export async function handleWebRequest(appState: AppState, event: APIGatewayProxyEvent) {
  const authResult = await authorizeUserRequest(appState, event)
  if (!authResult) {
    return event.path.startsWith('/app/fragment') ? notAuthorizedHTMLResponse : logoutResponse(appState)
  }
  const authorizedEvent = { ...event, ...authResult }
  return await router(authorizedEvent)(appState, authorizedEvent)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
