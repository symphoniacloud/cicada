import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { showLatestActivityRoute } from '../../web/showLatestActivity'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import { showHelloRoute } from '../../web/showHello'
import { CicadaAPIAuthorizedAPIHandler } from '../../inboundInterfaces/lambdaTypes'
import { showWorkflowRoute } from '../../web/showWorkflow'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { logoutResponse } from '../../domain/github/githubUserAuth/githubWebAuthHandler'
import { authorizeUserRequest } from '../../domain/webAuth/userAuthorizer'
import { notAuthorizedHTMLResponse } from '../../inboundInterfaces/standardHttpResponses'
import { logger } from '../../util/logging'
import { fragmentViewResult } from '../../web/views/viewResultWrappers'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup'
import { isFailure } from '../../util/structuredResult'
import { a, p } from '../../web/hiccough/hiccoughElements'
import { repoHeadingRoute } from '../../web/repoHeading'
import { repoActionsStatusRoute } from '../../web/repoActionsStatus'
import { repoRecentActivityRoute } from '../../web/repoRecentActivity'

const router = createRouter([
  showHelloRoute,
  showLatestActivityRoute,
  repoHeadingRoute,
  repoActionsStatusRoute,
  repoRecentActivityRoute,
  showWorkflowRoute
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

export const setupRequiredResponse = fragmentViewResult(
  p('Cicada GitHub app not ready yet.', a(startSetupRoute.path, 'Go here to start the setup process'))
)

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
