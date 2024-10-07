import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import { helloPageRoute } from '../../web/pages/helloPage'
import { CicadaAPIAuthorizedAPIHandler, CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
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
import { allAvailableAccountsRoute } from '../../web/fragments/allAvailableAccounts'
import { accountHeadingFragmentRoute } from '../../web/fragments/accountHeading'
import { isFragmentPath } from '../../web/routingCommon'
import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'

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
