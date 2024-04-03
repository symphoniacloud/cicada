import { AppState } from '../../../src/app/environment/AppState'
import { GithubLatestWorkflowRunEventEntity } from '../../../src/app/domain/entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { throwError } from '@symphoniacloud/dynamodb-entity-store'
import { GithubWorkflowRunEventEntity } from '../../../src/app/domain/entityStore/entities/GithubWorkflowRunEventEntity'
import { latestWorkflowRunEventsPerWorkflowForOwner } from '../../../src/app/domain/github/githubLatestWorkflowRunEvents'

export async function deleteWorkflowRunActivityForOwner(appState: AppState, ownerId: number) {
  await deleteRunEventsForOwner(appState, ownerId)
  await deleteLatestRunEventsPerWorkflowForOwner(appState, ownerId)
}

export async function deleteRunEventsForOwner(appState: AppState, ownerId: number) {
  const events = await getRunEventsForOwner(appState, ownerId)
  console.log(`Found ${events.length} run events to delete`)
  if (events.length > 0) {
    await appState.entityStore.for(GithubWorkflowRunEventEntity).advancedOperations.batchDelete(events)
  }
}

export async function getRunEventsForOwner(appState: AppState, ownerId: number) {
  return appState.entityStore.for(GithubWorkflowRunEventEntity).queryAllByPk({
    ownerId
  })
}

export async function deleteLatestRunEventsPerWorkflowForOwner(appState: AppState, ownerId: number) {
  const events = await latestWorkflowRunEventsPerWorkflowForOwner(appState, ownerId)
  console.log(`Found ${events.length} latest run events to delete`)
  if (events.length > 0) {
    await appState.entityStore.for(GithubLatestWorkflowRunEventEntity).advancedOperations.batchDelete(
      events.map((x) => {
        return {
          ownerId: x.ownerId,
          repoId: x.repoId,
          workflowId: x.workflowId ?? throwError('No WorkflowId')()
        }
      })
    )
  }
}
