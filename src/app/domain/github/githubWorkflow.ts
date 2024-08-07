import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoId, GithubWorkflowId } from '../types/GithubKeys'

export function findAccountName(workflows: GithubWorkflow[], accountId: GithubAccountId) {
  const workflowInAccount = workflows.find((w) => w.ownerId === accountId)
  // TODO - this will actually occur if we remove the account from Cicada, so need to handle
  if (!workflowInAccount) throw new Error(`Unable to find a workflow for accountId ${accountId}`)
  return workflowInAccount.ownerName
}

export function findRepoName(workflows: GithubWorkflow[], accountId: GithubAccountId, repoId: GithubRepoId) {
  const workflowInRepo = workflows.find((w) => w.ownerId === accountId && w.repoId === repoId)
  // TODO - this will actually occur if the repo is removed from Cicada, so need to handle
  if (!workflowInRepo) throw new Error(`Unable to find a repo for accountId ${accountId}, repoId ${repoId}`)
  return workflowInRepo.repoName
}

export function findWorkflowName(
  workflows: GithubWorkflow[],
  accountId: GithubAccountId,
  repoId: GithubRepoId,
  workflowId: GithubWorkflowId
) {
  const workflow = workflows.find(
    (w) => w.ownerId === accountId && w.repoId === repoId && w.workflowId === workflowId
  )
  // TODO - this will actually occur if the workflow is removed from Cicada, so need to handle
  if (!workflow)
    throw new Error(
      `Unable to find a workflow for accountId ${accountId}, repoId ${repoId}, workflowId ${workflowId}`
    )
  return workflow.workflowName || workflow.path
}
