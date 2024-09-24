import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'

export function findWorkflow(
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
  return workflow
}

export function findWorkflowName(workflows: GithubWorkflow[], workflowKey: GithubWorkflowKey) {
  const workflow = findWorkflow(workflows, workflowKey)
  return workflow.workflowName || workflow.path
}

export function findWorkflowsForRepo(workflows: GithubWorkflow[], repoKey: GithubRepoKey) {
  return workflows.filter((wf) => wf.ownerId === repoKey.ownerId && wf.repoId === repoKey.repoId)
}
