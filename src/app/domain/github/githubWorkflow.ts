import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { GithubWorkflowSummary } from '../types/GithubSummaries'
import { isSameRepo } from './githubRepo'
import { throwFunction } from '../../../multipleContexts/errors'

export function findWorkflowsForRepo(workflows: GithubWorkflow[], repoKey: GithubRepoKey) {
  return workflows.filter((wf) => wf.accountId === repoKey.accountId && wf.repoId === repoKey.repoId)
}

export function findWorkflowName(workflows: GithubWorkflowSummary[], workflowKey: GithubWorkflowKey) {
  // Workflow will be missing if the workflow is removed from Cicada, so need to handle
  const workflow =
    workflows.find((w) => isSameWorkflow(w, workflowKey)) ??
    throwFunction(`Unable to find a workflow for ${JSON.stringify(workflowKey)}`)()

  return usableWorkflowName(workflow)
}

export function isSameWorkflow(w1: GithubWorkflowKey, w2: GithubWorkflowKey): boolean {
  return isSameRepo(w1, w2) && w1.workflowId === w2.workflowId
}

export function usableWorkflowName(workflow: GithubWorkflowSummary) {
  return workflow.workflowName ?? workflow.path
}
