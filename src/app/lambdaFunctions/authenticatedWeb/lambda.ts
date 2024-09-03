import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import { showHelloRoute } from '../../web/pages/showHello'
import { CicadaAPIAuthorizedAPIHandler } from '../../inboundInterfaces/lambdaTypes'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { logoutResponse } from '../../domain/github/githubUserAuth/githubWebAuthHandler'
import { authorizeUserRequest } from '../../domain/webAuth/userAuthorizer'
import { notAuthorizedHTMLResponse } from '../../web/htmlResponses'
import { logger } from '../../util/logging'
import { pageViewResultWithoutHtmx } from '../../web/viewResultWrappers'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup'
import { isFailure } from '../../util/structuredResult'
import { a, p } from '../../web/hiccough/hiccoughElements'
import { repoHeadingRoute } from '../../web/fragments/repoHeading'
import { actionsStatusRoute } from '../../web/fragments/actionsStatus'
import { gitHubActivityRoute } from '../../web/fragments/gitHubActivity'
import { workflowHeadingRoute } from '../../web/fragments/workflowHeading'
import { getUserSettingsRoute } from '../../web/fragments/getUserSettings'
import { postUserSettingRoute } from '../../web/fragments/postUserSetting'
import { postResetUserSettingsRoute } from '../../web/fragments/postResetUserSettings'

const router = createRouter([
  repoHeadingRoute,
  workflowHeadingRoute,
  actionsStatusRoute,
  gitHubActivityRoute,
  getUserSettingsRoute,
  postUserSettingRoute,
  postResetUserSettingsRoute,
  showHelloRoute
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

export const setupRequiredResponse = pageViewResultWithoutHtmx([
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
