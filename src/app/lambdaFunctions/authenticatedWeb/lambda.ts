import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { showLatestActivityRoute } from '../../web/showLatestActivity'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import { showHelloRoute } from '../../web/showHello'
import { showRepoRoute } from '../../web/showRepo'
import { CicadaAPIAuthorizedAPIHandler } from '../../inboundInterfaces/lambdaTypes'
import { showWorkflowRoute } from '../../web/showWorkflow'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { logoutResponse } from '../../domain/github/githubUserAuth/githubWebAuthHandler'
import { authorizeUserRequest } from '../../domain/webAuth/userAuthorizer'
import { notAuthorizedHTMLResponse } from '../../inboundInterfaces/standardHttpResponses'

const router = createRouter([showHelloRoute, showLatestActivityRoute, showRepoRoute, showWorkflowRoute])

let appState: AppState

export const baseHandler: CicadaAPIAuthorizedAPIHandler = async (event: APIGatewayProxyEvent) => {
  if (!appState) {
    appState = await lambdaStartup()
  }
  return await handleWebRequest(appState, event)
}

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
