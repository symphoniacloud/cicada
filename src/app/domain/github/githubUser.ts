import { AppState } from '../../environment/AppState'
import { batchPutUsers, getUserById } from '../entityStore/entities/GithubUserEntity'
import { fromRawGithubUser, GithubUser } from '../types/GithubUser'
import { GithubInstallation } from '../types/GithubInstallation'
import { RawGithubUser } from '../types/rawGithub/RawGithubUser'
import { setMemberships } from './githubMembership'
import { GithubUserToken } from '../types/GithubUserToken'
import { isGithubCheckRequired, saveOrRefreshGithubUserToken } from './githubUserToken'
import { fromRawGithubUserId } from '../types/GithubUserId'

export async function processRawUsers(
  appState: AppState,
  rawGithubUsers: RawGithubUser[],
  installation: GithubInstallation
) {
  await processUsers(appState, rawGithubUsers.map(fromRawGithubUser), installation)
}

async function processUsers(appState: AppState, users: GithubUser[], installation: GithubInstallation) {
  await batchPutUsers(appState.entityStore, users)
  await setMemberships(appState, users, installation.accountId)
}

export async function getUserByAuthToken(appState: AppState, token: string) {
  const rawGithubUser = await appState.githubClient.getGithubUser(token)
  if (!rawGithubUser) return undefined

  const cicadaUser = await getUserById(appState.entityStore, fromRawGithubUserId(rawGithubUser.id))
  if (cicadaUser)
    await saveOrRefreshGithubUserToken(appState, {
      token,
      userId: cicadaUser.userId,
      userName: cicadaUser.userName
    })

  return cicadaUser
}

export async function getUserByTokenRecord(appState: AppState, tokenRecord: GithubUserToken) {
  return isGithubCheckRequired(appState.clock, tokenRecord)
    ? getUserByAuthToken(appState, tokenRecord.token)
    : getUserById(appState.entityStore, tokenRecord.userId)
}
