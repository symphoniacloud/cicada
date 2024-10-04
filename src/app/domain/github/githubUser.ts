import { AppState } from '../../environment/AppState'
import { batchPutUsers, getUserById } from '../entityStore/entities/GithubUserEntity'
import { fromRawGithubUser } from '../types/GithubUser'
import { GithubInstallation } from '../types/GithubInstallation'
import { RawGithubUser } from '../types/rawGithub/RawGithubUser'
import { isUserAMemberOfAnyInstalledAccount, setMemberships } from './githubMembership'
import { getTokenRecord, saveOrRefreshGithubUserToken } from './githubUserToken'
import { fromRawGithubUserId } from '../types/GithubUserId'
import { isFailure } from '../../util/structuredResult'

export async function processRawUsers(
  appState: AppState,
  rawGithubUsers: RawGithubUser[],
  installation: GithubInstallation
) {
  const users = rawGithubUsers.map(fromRawGithubUser)
  await batchPutUsers(appState.entityStore, users)
  await setMemberships(appState, users, installation.accountId)
}

// Only used during request authorization
// This is the sort of thing it would be nice to have DynamoDB caching for since
// there are multiple database calls per request here
export async function getUserByTokenUsingTokenCache(appState: AppState, token: string) {
  const tokenRecordResult = await getTokenRecord(appState, token)
  if (isFailure(tokenRecordResult)) {
    // Was never a valid token, or was last used longer ago than the table's TTL
    // Either way - don't bother going to GitHub - just force user to relogin
    if (tokenRecordResult.failureResult === 'NO_TOKEN') return undefined
    // else result expired in our local cache, but it was valid earlier, so go check with GitHub again
    return getUserByTokenWithGithubCheck(appState, token)
  }

  // Token is valid - look up user by user ID on the token
  const user = await getUserById(appState.entityStore, tokenRecordResult.result.userId)
  // If user doesn't exist, or if there are no memberships for this user, then this isn't a valid Cicada user
  if (!user || !(await isUserAMemberOfAnyInstalledAccount(appState, user))) return undefined

  return user
}

// Used when a user logs in via GitHub, or during API GW authorization when local cached token has expired
export async function getUserByTokenWithGithubCheck(appState: AppState, token: string) {
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
