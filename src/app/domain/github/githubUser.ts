import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { GithubUserEntity } from '../entityStore/entities/GithubUserEntity'
import { fromRawGithubUser, GithubUser } from '../types/GithubUser'
import { GithubInstallation } from '../types/GithubInstallation'
import { RawGithubUser } from '../types/rawGithub/RawGithubUser'
import { setMemberships } from './githubMembership'

export async function processRawUsers(
  appState: AppState,
  rawGithubUsers: RawGithubUser[],
  installation: GithubInstallation
) {
  await processUsers(appState, rawGithubUsers.map(fromRawGithubUser), installation)
}

async function processUsers(appState: AppState, users: GithubUser[], installation: GithubInstallation) {
  await saveUsers(appState, users)
  await setMemberships(appState, users, installation.accountId)
}

export async function saveUsers(appState: AppState, users: GithubUser[]) {
  await appState.entityStore.for(GithubUserEntity).advancedOperations.batchPut(users)
}

export async function getUserByAuthToken(appState: AppState, token: string) {
  // TOEventually - don't require calling GitHub API for all user requests - cache for some period
  const rawGithubUser = await appState.githubClient.getGithubUser(token)
  if (!rawGithubUser) return undefined
  const cicadaUser = await getUserById(appState, rawGithubUser.id)
  if (!cicadaUser) {
    logger.info(
      `User ${rawGithubUser.login} is a valid GitHub user but does not have access to any Cicada resources`
    )
  }
  return cicadaUser
}

export async function getUserById(appState: AppState, id: number) {
  return await appState.entityStore.for(GithubUserEntity).getOrUndefined({ id })
}
