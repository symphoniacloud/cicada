import { AppState } from '../../environment/AppState'
import { getGithubUserToken, putGithubUserToken } from '../entityStore/entities/GithubUserTokenEntity'
import { secondsTimestampInFutureHours, timestampSecondsIsInPast } from '../../util/dateAndTime'
import { GithubUserToken } from '../types/GithubUserToken'
import { failedWithResult, Result, successWith } from '../../util/structuredResult'

const EXPIRE_CACHED_GITHUB_TOKENS_HOURS = 1

export async function saveOrRefreshGithubUserToken(
  appState: AppState,
  tokenRecord: Pick<GithubUserToken, 'token' | 'userId' | 'userName'>
) {
  await putGithubUserToken(
    appState.entityStore,
    {
      ...tokenRecord,
      nextCheckTime: secondsTimestampInFutureHours(appState.clock, EXPIRE_CACHED_GITHUB_TOKENS_HOURS)
    },
    7
  )
}

export const INVALID_TOKEN = ['NO_TOKEN', 'TOKEN_EXPIRED'] as const
export type InvalidTokenStatus = (typeof INVALID_TOKEN)[number]

export async function getTokenRecord(
  appState: AppState,
  token: string
): Promise<Result<GithubUserToken, InvalidTokenStatus>> {
  const tokenRecord = await getGithubUserToken(appState.entityStore, token)
  if (!tokenRecord) return failedWithResult('No token', 'NO_TOKEN')

  // If token record was saved more than EXPIRE_CACHED_GITHUB_TOKENS_HOURS ago then check user token with GitHub again
  return timestampSecondsIsInPast(appState.clock, tokenRecord.nextCheckTime)
    ? failedWithResult('Expired', 'TOKEN_EXPIRED')
    : successWith(tokenRecord)
}
