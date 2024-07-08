import { AppState } from '../../environment/AppState'
import { GithubUserEntity } from '../entityStore/entities/GithubUserEntity'
import { fromRawGithubUser, GithubUser } from '../types/GithubUser'
import { GithubInstallation } from '../types/GithubInstallation'
import { RawGithubUser } from '../types/rawGithub/RawGithubUser'
import { setMemberships } from './githubMembership'
import { GithubUserToken } from '../types/GithubUserToken'
import { isGithubCheckRequired, saveOrRefreshGithubUserToken } from './githubUserToken'

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
  const rawGithubUser = await appState.githubClient.getGithubUser(token)
  if (!rawGithubUser) return undefined

  const cicadaUser = await getUserById(appState, rawGithubUser.id)
  if (cicadaUser)
    await saveOrRefreshGithubUserToken(appState, {
      token,
      userId: cicadaUser.id,
      userLogin: cicadaUser.login
    })

  return cicadaUser
}

export async function getUserByTokenRecord(appState: AppState, tokenRecord: GithubUserToken) {
  return isGithubCheckRequired(appState.clock, tokenRecord)
    ? getUserByAuthToken(appState, tokenRecord.token)
    : getUserById(appState, tokenRecord.userId)
}

export async function getUserById(appState: AppState, id: number) {
  return await appState.entityStore.for(GithubUserEntity).getOrUndefined({ id })
}
