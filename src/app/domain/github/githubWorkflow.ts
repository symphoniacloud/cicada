import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'

export function findAccountName(workflows: GithubWorkflow[], accountId: GithubAccountId) {
  const workflowInAccount = workflows.find((w) => w.ownerId === accountId)
  // TODO - this will actually occur if we remove the account from Cicada, so need to handle
  if (!workflowInAccount) throw new Error(`Unable to find a workflow for accountId ${accountId}`)
  return workflowInAccount.ownerName
}

export function findRepoName(workflows: GithubWorkflow[], { ownerId, repoId }: GithubRepoKey) {
  const workflowInRepo = workflows.find((w) => w.ownerId === ownerId && w.repoId === repoId)
  // TODO - this will actually occur if the repo is removed from Cicada, so need to handle
  if (!workflowInRepo) throw new Error(`Unable to find a repo for ownerId ${ownerId}, repoId ${repoId}`)
  return workflowInRepo.repoName
}

export function findWorkflowName(
  workflows: GithubWorkflow[],
  { ownerId, repoId, workflowId }: GithubWorkflowKey
) {
  const workflow = workflows.find(
    (w) => w.ownerId === ownerId && w.repoId === repoId && w.workflowId === workflowId
  )
  // TODO - this will actually occur if the workflow is removed from Cicada, so need to handle
  if (!workflow)
    throw new Error(
      `Unable to find a workflow for ownerId ${ownerId}, repoId ${repoId}, workflowId ${workflowId}`
    )
  return workflow.workflowName || workflow.path
}

export function findWorkflowsForRepo(workflows: GithubWorkflow[], repoKey: GithubRepoKey) {
  return workflows.filter((wf) => wf.ownerId === repoKey.ownerId && wf.repoId === repoKey.repoId)
}

export function findUniqueRepoIdsForAccount(workflows: GithubWorkflow[], accountId: GithubAccountId) {
  return [...new Set(workflows.filter((wf) => wf.ownerId === accountId).map((wf) => wf.repoId))]
}

export function findUniqueAccountIds(workflows: GithubWorkflow[]) {
  return [...new Set(workflows.map((wf) => wf.ownerId))]
}
