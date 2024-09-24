import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pagePath } from '../routingCommon'
import { adminPageRoute } from './adminPage'
import { AppState } from '../../environment/AppState'
import { foundRedirectResponse } from '../../inboundInterfaces/httpResponses'
import { getAddPublicAccountParameter } from './requestParsing/getAddPublicAccountParameter'
import { isFailure } from '../../util/structuredResult'
import { createBadRequestResponse } from './views/badRequestView'
import { savePublicAccountWithName } from '../../domain/github/githubPublicAccount'
import { internalErrorHTMLResponse } from '../htmlResponses'

export const adminAddPublicAccountPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('admin/addPublicAccount'),
  method: 'POST',
  target: adminAddPublicAccountPage
}

export async function adminAddPublicAccountPage(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parseResult = getAddPublicAccountParameter(event)
  if (isFailure(parseResult)) {
    return createBadRequestResponse('Invalid Request - did you enter an account name?')
  }
  const saveResult = await savePublicAccountWithName(appState, event.userId, parseResult.result.accountName)
  if (isFailure(saveResult)) {
    return internalErrorHTMLResponse
  }

  return foundRedirectResponse(adminPageRoute.path)
}
