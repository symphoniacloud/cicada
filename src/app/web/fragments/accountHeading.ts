import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { notFoundHTMLResponse } from '../htmlResponses'
import { fragmentPath } from '../routingCommon'
import { createAccountHeadingResponse } from './views/accountHeadingView'
import { getAccountCoordinates } from './requestParsing/getAccountCoordinates'
import { getAccountForUser } from '../../domain/github/githubAccount'

export const accountHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('account/heading'),
  target: accountHeading
}

export async function accountHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const accountCoordinatesResult = getAccountCoordinates(event)

  if (isFailure(accountCoordinatesResult)) return accountCoordinatesResult.failureResult

  const account = await getAccountForUser(appState, event.userId, accountCoordinatesResult.result.ownerId)
  if (!account) return notFoundHTMLResponse

  return createAccountHeadingResponse(account)
}
