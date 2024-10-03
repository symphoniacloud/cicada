import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pagePath } from '../routingCommon'
import { createAdminPageResponse } from './views/adminPageView'
import { loadInstallationAccountStructureForUser } from '../../domain/github/githubAccountStructure'

export const adminPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('admin'),
  target: adminPage
}

export async function adminPage(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const installationStructure = await loadInstallationAccountStructureForUser(appState, event.userId)
  return createAdminPageResponse(Object.values(installationStructure.publicAccounts))
}
