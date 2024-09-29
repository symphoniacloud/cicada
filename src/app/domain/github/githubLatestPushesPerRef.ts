import { AppState } from '../../environment/AppState'
import { GithubPush } from '../types/GithubPush'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import {
  GithubLatestPushPerRefEntity,
  githubLatestPushPerRefGsiSk
} from '../entityStore/entities/GithubLatestPushPerRefEntity'
import { rangeWhereSkGreaterThan } from '@symphoniacloud/dynamodb-entity-store/dist/cjs/support/querySupport'
import { dateTimeAddDays } from '../../util/dateAndTime'
import { GithubAccountId } from '../types/GithubAccountId'

export async function saveLatestPushes(appState: AppState, newPushes: GithubPush[]) {
  for (const newPush of newPushes) {
    await executeAndCatchConditionalCheckFailed(async () => {
      await appState.entityStore.for(GithubLatestPushPerRefEntity).put(newPush, {
        conditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
        expressionAttributeNames: { '#dateTime': 'dateTime' },
        expressionAttributeValues: { ':newDateTime': newPush.dateTime }
      })
    })
  }
}

export async function recentActiveBranchesForAccounts(appState: AppState, accountIds: GithubAccountId[]) {
  return (
    await Promise.all(accountIds.map(async (accountId) => recentActiveBranches(appState, accountId)))
  ).flat()
}

export async function recentActiveBranches(appState: AppState, accountId: GithubAccountId) {
  const startOfTimeRange = dateTimeAddDays(appState.clock.now(), -14).toISOString()
  return await appState.entityStore
    .for(GithubLatestPushPerRefEntity)
    .queryAllWithGsiByPkAndSk(
      { accountId },
      rangeWhereSkGreaterThan(githubLatestPushPerRefGsiSk({ dateTime: startOfTimeRange })),
      {
        scanIndexForward: false
      }
    )
}
