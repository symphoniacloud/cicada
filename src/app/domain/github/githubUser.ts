import { AppState } from '../../environment/AppState.js'
import { batchPutUsers, getUserById } from '../entityStore/entities/GithubUserEntity.js'
import { isUserAMemberOfAnyInstalledAccount, setMemberships } from './githubMembership.js'
import { getTokenRecord, saveOrRefreshGithubUserToken } from './githubUserToken.js'
import { failedWith, isFailure, Result, successWith } from '../../util/structuredResult.js'
import { fromRawGithubUserId } from './mappings/toFromRawGitHubIds.js'
import { GitHubInstallation, GitHubUser } from '../../ioTypes/GitHubTypes.js'
import { RawGithubUser } from '../../ioTypes/RawGitHubTypes.js'
import { RawGithubUserSchema } from '../../ioTypes/RawGitHubSchemas.js'
import { gitHubUserFromRaw } from './mappings/FromRawGitHubMappings.js'

export async function processRawUsers(
  appState: AppState,
  rawGithubUsers: RawGithubUser[],
  installation: GitHubInstallation
) {
  const users = rawGithubUsers.map(gitHubUserFromRaw)
  await batchPutUsers(appState.entityStore, users)
  await setMemberships(appState, users, installation.accountId)
}

// Only used during request authorization
// This is the sort of thing it would be nice to have DynamoDB caching for since
// there are multiple database calls per request here
export async function getUserByTokenUsingTokenCache(
  appState: AppState,
  token: string
): Promise<Result<GitHubUser>> {
  const tokenRecordResult = await getTokenRecord(appState, token)
  if (isFailure(tokenRecordResult)) {
    // Was never a valid token, or was last used longer ago than the table's TTL
    // Either way - don't bother going to GitHub - just force user to relogin
    if (tokenRecordResult.failureResult === 'NO_TOKEN') return tokenRecordResult
    // else result expired in our local cache, but it was valid earlier, so go check with GitHub again
    return getUserByTokenWithGithubCheck(appState, token)
  }

  // Token is valid - look up user by user ID on the token
  const userId = tokenRecordResult.result.userId
  const user = await getUserById(appState.entityStore, userId)
  // If user doesn't exist, or if there are no memberships for this user, then this isn't a valid Cicada user
  if (!user || !(await isUserAMemberOfAnyInstalledAccount(appState, user)))
    return failedWith(`Invalid Cicada user ${userId}`)

  return successWith(user)
}

// Used when a user logs in via GitHub, or during API GW authorization when local cached token has expired
export async function getUserByTokenWithGithubCheck(
  appState: AppState,
  token: string
): Promise<Result<GitHubUser>> {
  const rawUserResult = await appState.githubClient.getGithubUser(token)
  if (isFailure(rawUserResult)) return rawUserResult
  const parsedRawUser = RawGithubUserSchema.parse(rawUserResult.result)
  const cicadaUser = await getUserById(appState.entityStore, fromRawGithubUserId(parsedRawUser.id))
  if (!cicadaUser) return failedWith(`User not in Cicada ${parsedRawUser.login}`)
  await saveOrRefreshGithubUserToken(appState, {
    token,
    userId: cicadaUser.userId,
    userName: cicadaUser.userName
  })
  return successWith(cicadaUser)
}
