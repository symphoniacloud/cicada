import { GithubRepoSummary, GithubWorkflowSummary } from '../types/GithubSummaries'
import { AppState } from '../../environment/AppState'
import { RawGithubWorkflow } from '../types/rawGithub/RawGithubWorkflow'
import { fromRawGithubWorkflow, GithubWorkflow } from '../types/GithubWorkflow'
import { getWorkflowsForAccount, putWorkflows } from '../entityStore/entities/GithubWorkflowEntity'
import { GithubAccountId } from '../types/GithubAccountId'
import { narrowToRepoSummary } from './githubRepo'

export async function processRawWorkflows(
  appState: AppState,
  repo: GithubRepoSummary,
  rawWorkflows: RawGithubWorkflow[]
) {
  const workflows = rawWorkflows.map((raw) => fromRawGithubWorkflow(repo, raw))
  await putWorkflows(appState.entityStore, workflows)
  return workflows
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
