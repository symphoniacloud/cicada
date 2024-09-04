import { AppState } from '../../environment/AppState'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import {
  GithubLatestWorkflowRunEventEntity,
  githubLatestWorkflowRunEventSkPrefix
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { rangeWhereSkBeginsWith } from '@symphoniacloud/dynamodb-entity-store'
import { sortBy } from '../../util/collections'
import { getEventUpdatedTimestamp } from './githubCommon'
import { GithubRepoKey } from '../types/GithubKeys'

export async function saveLatestEvents(appState: AppState, newEvents: GithubWorkflowRunEvent[]) {
  // Update latest events if they are newer
  // TODO - need to think about concurrent runs. E.g. if two runs are in progress, one completes, the status is still "in progress"
  for (const newEvent of newEvents) {
    await executeAndCatchConditionalCheckFailed(async () => {
      await appState.entityStore.for(GithubLatestWorkflowRunEventEntity).put(newEvent, {
        conditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
        expressionAttributeNames: { '#updatedAt': 'updatedAt' },
        expressionAttributeValues: { ':newUpdatedAt': newEvent.updatedAt }
      })
    })
  }
}

export async function latestWorkflowRunEventsPerWorkflowForOwners(appState: AppState, accountIds: number[]) {
  return (
    await Promise.all(
      accountIds.map(async (accountId) => latestWorkflowRunEventsPerWorkflowForOwner(appState, accountId))
    )
  ).flat()
}

export async function latestWorkflowRunEventsPerWorkflowForOwner(appState: AppState, ownerId: number) {
  return await appState.entityStore.for(GithubLatestWorkflowRunEventEntity).queryAllWithGsiByPk(
    { ownerId },
    {
      scanIndexForward: false
    }
  )
}

export async function latestWorkflowRunEventsPerWorkflowForRepo(appState: AppState, repoKey: GithubRepoKey) {
  const latestEvents = await appState.entityStore
    .for(GithubLatestWorkflowRunEventEntity)
    .queryAllByPkAndSk(repoKey, rangeWhereSkBeginsWith(githubLatestWorkflowRunEventSkPrefix(repoKey)))

  return sortBy(latestEvents, getEventUpdatedTimestamp, false)
}
