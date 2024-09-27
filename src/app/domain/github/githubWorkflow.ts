import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'

export function findWorkflow(
  workflows: GithubWorkflow[],
  { accountId, repoId, workflowId }: GithubWorkflowKey
) {
  const workflow = workflows.find(
    (w) => w.accountId === accountId && w.repoId === repoId && w.workflowId === workflowId
  )
  // TODO - this will actually occur if the workflow is removed from Cicada, so need to handle
  if (!workflow)
    throw new Error(
      `Unable to find a workflow for accountId ${accountId}, repoId ${repoId}, workflowId ${workflowId}`
    )
  return workflow
}

export function findWorkflowName(workflows: GithubWorkflow[], workflowKey: GithubWorkflowKey) {
  const workflow = findWorkflow(workflows, workflowKey)
  return workflow.workflowName || workflow.path
}

export function findWorkflowsForRepo(workflows: GithubWorkflow[], repoKey: GithubRepoKey) {
  return workflows.filter((wf) => wf.accountId === repoKey.accountId && wf.repoId === repoKey.repoId)
}
