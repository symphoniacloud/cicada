import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure } from '../../util/structuredResult.js'
import { notFoundHTMLResponse } from '../htmlResponses.js'
import { fragmentPath } from '../routingCommon.js'
import { createAccountHeadingResponse } from './views/accountHeadingView.js'
import { parseAccountKeyFromQueryString } from './requestParsing/parseFragmentQueryStrings.js'
import { getAccountStructure } from '../../domain/github/userScopeReferenceData.js'

export const accountHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('account/heading'),
  target: accountHeading
}

export async function accountHeading(_: AppState, event: CicadaAuthorizedAPIEvent) {
  const accountCoordinatesResult = parseAccountKeyFromQueryString(event)
  if (isFailure(accountCoordinatesResult)) return accountCoordinatesResult.failureResult

  const account = getAccountStructure(event.refData, accountCoordinatesResult.result.accountId)
  if (!account) return notFoundHTMLResponse

  return createAccountHeadingResponse(account)
}
