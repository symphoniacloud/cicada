import { isIntegerStringWithPrefix } from '../../util/types'

const GITHUB_WORKFLOW_ID_PREFIX = `GHWorkflow`

export type GithubWorkflowId = `${typeof GITHUB_WORKFLOW_ID_PREFIX}${number}`

export function isGithubWorkflowId(x: unknown): x is GithubWorkflowId {
  return isIntegerStringWithPrefix(GITHUB_WORKFLOW_ID_PREFIX, x)
}

export function fromRawGithubWorkflowId(x: unknown): GithubWorkflowId {
  const cicadaGithubWorkflowId = `${GITHUB_WORKFLOW_ID_PREFIX}${x}`
  if (!isGithubWorkflowId(cicadaGithubWorkflowId)) throw new Error(`Invalid raw github workflow id: ${x}`)
  return cicadaGithubWorkflowId
}
