import { AppState } from '../../../src/app/environment/AppState'
import {
  batchDeleteLatestWorkflowRunEvents,
  latestWorkflowRunEventsPerWorkflowForAccount
} from '../../../src/app/domain/entityStore/entities/GithubLatestWorkflowRunEventEntity'
import {
  batchDeleteGithubWorkflowRunEvents,
  onlyUseInTestsGetAllGithubWorkflowRunEventsForAccount
} from '../../../src/app/domain/entityStore/entities/GithubWorkflowRunEventEntity'
import { GithubAccountId } from '../../../src/app/domain/types/GithubAccountId'

export async function deleteWorkflowRunActivityForAccount(appState: AppState, accountId: GithubAccountId) {
  await deleteRunEventsForAccount(appState, accountId)
  await deleteLatestRunEventsPerWorkflowForAccount(appState, accountId)
}

export async function getRunEventsForAccount(appState: AppState, accountId: GithubAccountId) {
  return await onlyUseInTestsGetAllGithubWorkflowRunEventsForAccount(appState.entityStore, accountId)
}

export async function deleteRunEventsForAccount(appState: AppState, accountId: GithubAccountId) {
  await batchDeleteGithubWorkflowRunEvents(
    appState.entityStore,
    await getRunEventsForAccount(appState, accountId)
  )
}

export async function deleteLatestRunEventsPerWorkflowForAccount(
  appState: AppState,
  accountId: GithubAccountId
) {
  await batchDeleteLatestWorkflowRunEvents(
    appState.entityStore,
    await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
  )
}
