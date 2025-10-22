import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { pagePath } from '../routingCommon.js'
import { adminPageRoute } from './adminPage.js'
import { AppState } from '../../environment/AppState.js'
import { foundRedirectResponse } from '../../inboundInterfaces/httpResponses.js'
import { getAddPublicAccountParameter } from './requestParsing/getAddPublicAccountParameter.js'
import { isFailure } from '../../util/structuredResult.js'
import { createBadRequestResponse } from './views/badRequestView.js'
import { savePublicAccountWithName } from '../../domain/github/githubPublicAccount.js'
import { internalErrorHTMLResponse } from '../htmlResponses.js'

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
  const saveResult = await savePublicAccountWithName(
    appState,
    event.refData.userId,
    parseResult.result.accountName
  )
  if (isFailure(saveResult)) {
    return internalErrorHTMLResponse
  }

  return foundRedirectResponse(adminPageRoute.path)
}
