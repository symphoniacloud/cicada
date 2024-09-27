import { AppState } from '../../../src/app/environment/AppState'
import {
  GithubLatestWorkflowRunEventEntity,
  latestWorkflowRunEventsPerWorkflowForAccount
} from '../../../src/app/domain/entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { throwError } from '@symphoniacloud/dynamodb-entity-store'
import { GithubWorkflowRunEventEntity } from '../../../src/app/domain/entityStore/entities/GithubWorkflowRunEventEntity'

export async function deleteWorkflowRunActivityForAccount(appState: AppState, accountId: number) {
  await deleteRunEventsForAccount(appState, accountId)
  await deleteLatestRunEventsPerWorkflowForAccount(appState, accountId)
}

export async function deleteRunEventsForAccount(appState: AppState, accountId: number) {
  const events = await getRunEventsForAccount(appState, accountId)
  console.log(`Found ${events.length} run events to delete`)
  if (events.length > 0) {
    await appState.entityStore.for(GithubWorkflowRunEventEntity).advancedOperations.batchDelete(events)
  }
}

export async function getRunEventsForAccount(appState: AppState, accountId: number) {
  return appState.entityStore.for(GithubWorkflowRunEventEntity).queryAllByPk({
    accountId
  })
}

export async function deleteLatestRunEventsPerWorkflowForAccount(appState: AppState, accountId: number) {
  const events = await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
  console.log(`Found ${events.length} latest run events to delete`)
  if (events.length > 0) {
    await appState.entityStore.for(GithubLatestWorkflowRunEventEntity).advancedOperations.batchDelete(
      events.map((x) => {
        return {
          accountId: x.accountId,
          repoId: x.repoId,
          workflowId: x.workflowId ?? throwError('No WorkflowId')()
        }
      })
    )
  }
}
