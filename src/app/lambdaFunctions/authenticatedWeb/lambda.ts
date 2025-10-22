import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter.js'
import { helloPageRoute } from '../../web/pages/helloPage.js'
import {
  CicadaAPIAuthorizedAPIHandler,
  CicadaAuthorizedAPIEvent
} from '../../inboundInterfaces/lambdaTypes.js'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { logoutResponse } from '../../domain/github/githubUserAuth/githubWebAuthHandler.js'
import { authorizeUserRequest } from '../../domain/webAuth/userAuthorizer.js'
import { notAuthorizedHTMLResponse } from '../../web/htmlResponses.js'
import { logger } from '../../util/logging.js'
import { pageViewResponse } from '../../web/viewResultWrappers.js'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup.js'
import { isFailure } from '../../util/structuredResult.js'
import { a, p } from '../../web/hiccough/hiccoughElements.js'
import { repoHeadingFragmentRoute } from '../../web/fragments/repoHeading.js'
import { actionsStatusFragmentRoute } from '../../web/fragments/actionsStatus.js'
import { gitHubActivityFragmentRoute } from '../../web/fragments/gitHubActivity.js'
import { workflowHeadingFragmentRoute } from '../../web/fragments/workflowHeading.js'
import { getUserSettingsFragmentRoute } from '../../web/fragments/getUserSettings.js'
import { postUserSettingFragmentRoute } from '../../web/fragments/postUserSetting.js'
import { postResetUserSettingsFragmentRoute } from '../../web/fragments/postResetUserSettings.js'
import { adminPageRoute } from '../../web/pages/adminPage.js'
import { adminAddPublicAccountPageRoute } from '../../web/pages/adminAddPublicAccountPage.js'
import { allAvailableAccountsRoute } from '../../web/fragments/allAvailableAccounts.js'
import { accountHeadingFragmentRoute } from '../../web/fragments/accountHeading.js'
import { isFragmentPath } from '../../web/routingCommon.js'
import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData.js'

const router = createRouter([
  accountHeadingFragmentRoute,
  repoHeadingFragmentRoute,
  workflowHeadingFragmentRoute,
  actionsStatusFragmentRoute,
  gitHubActivityFragmentRoute,
  allAvailableAccountsRoute,
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
    if (isFailure(startup)) return appNotReadyResponse()
    appState = startup.result
  }

  return await handleWebRequest(appState, event)
}

function appNotReadyResponse() {
  logger.info('Github App not ready, returning boilerplate page')
  return pageViewResponse([
    p('Cicada GitHub app not ready yet.', a(startSetupRoute.path, 'Go here to start the setup process'))
  ])
}

// TOEventually - top level error handler
export async function handleWebRequest(appState: AppState, event: APIGatewayProxyEvent) {
  // This Lambda function isn't preceded by the API Gateway authorizer since we want to return HTML on failure
  // Instead we do authorization here, but using the same authorization logic as the API Gateway authorizer
  const authResult = await authorizeUserRequest(appState, event)
  if (!authResult) {
    return isFragmentPath(event.path) ? notAuthorizedHTMLResponse : logoutResponse(appState)
  }

  // TOEventually - something nicer here. We use this route for remote tests, but in remote tests
  // don't want to load ref data. So for now use this hack
  if (event.path === helloPageRoute.path) {
    return await router(event as CicadaAuthorizedAPIEvent)(appState, {
      refData: {
        userId: authResult.userId
      },
      username: authResult.username
    } as CicadaAuthorizedAPIEvent)
  }

  // Load reference data here so individual route handlers don't need to
  const refData = await loadUserScopeReferenceData(appState, authResult.userId)
  const authorizedEvent: CicadaAuthorizedAPIEvent = { ...event, refData, username: authResult.username }
  return await router(authorizedEvent)(appState, authorizedEvent)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
