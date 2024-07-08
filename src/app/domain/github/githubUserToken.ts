import { AppState } from '../../environment/AppState'
import { GithubUserTokenEntity } from '../entityStore/entities/GithubUserTokenEntity'
import { Clock, secondsTimestampInFutureHours, timestampSecondsIsInPast } from '../../util/dateAndTime'
import { GithubUserToken } from '../types/GithubUserToken'

const EXPIRE_CACHED_GITHUB_TOKENS_HOURS = 1

export async function saveOrRefreshGithubUserToken(
  appState: AppState,
  tokenRecord: Pick<GithubUserToken, 'token' | 'userId' | 'userLogin'>
) {
  await appState.entityStore.for(GithubUserTokenEntity).put(
    {
      ...tokenRecord,
      nextCheckTime: secondsTimestampInFutureHours(appState.clock, EXPIRE_CACHED_GITHUB_TOKENS_HOURS)
    },
    {
      ttlInFutureDays: 7
    }
  )
}

export async function getGithubUserTokenOrUndefined(appState: AppState, token: string) {
  return await appState.entityStore.for(GithubUserTokenEntity).getOrUndefined({ token })
}

// If token record was saved more than EXPIRE_CACHED_GITHUB_TOKENS_HOURS ago then check user token with GitHub agaion
export function isGithubCheckRequired(clock: Clock, token: GithubUserToken) {
  return timestampSecondsIsInPast(clock, token.nextCheckTime)
}
