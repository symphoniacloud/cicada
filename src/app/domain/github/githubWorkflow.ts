import { GithubRepoSummary, GithubWorkflowSummary } from '../types/GithubSummaries.js'
import { AppState } from '../../environment/AppState.js'
import { RawGithubWorkflow } from '../types/rawGithub/RawGithubWorkflow.js'
import { fromRawGithubWorkflow, GithubWorkflow } from '../types/GithubWorkflow.js'
import { getWorkflowsForAccount, putWorkflows } from '../entityStore/entities/GithubWorkflowEntity.js'
import { GithubAccountId } from '../types/GithubAccountId.js'
import { narrowToRepoSummary } from './githubRepo.js'

export async function processRawWorkflows(
  appState: AppState,
  repo: GithubRepoSummary,
  rawWorkflows: RawGithubWorkflow[]
) {
  return putWorkflows(
    appState.entityStore,
    rawWorkflows.map((raw) => fromRawGithubWorkflow(repo, raw))
  )
}

export function narrowToWorkflowSummary<T extends GithubWorkflowSummary>(x: T): GithubWorkflowSummary {
  return {
    ...narrowToRepoSummary(x),
    workflowId: x.workflowId,
    workflowName: x.workflowName
  }
}

export async function getActiveWorkflowsForAccount(
  appState: AppState,
  accountId: GithubAccountId
): Promise<GithubWorkflow[]> {
  return (await getWorkflowsForAccount(appState.entityStore, accountId)).filter(isActiveWorkflow)
}

export async function isActiveWorkflow(wf: GithubWorkflow) {
  return wf.workflowState === 'active'
}
