import { isIntegerStringWithPrefix } from '../../util/types.js'

const GITHUB_WORKFLOW_RUN_ID_PREFIX = `GHWorkflowRun`
export type GithubWorkflowRunId = `${typeof GITHUB_WORKFLOW_RUN_ID_PREFIX}${number}`

export function isGithubWorkflowRunId(x: unknown): x is GithubWorkflowRunId {
  return isIntegerStringWithPrefix(GITHUB_WORKFLOW_RUN_ID_PREFIX, x)
}

export function fromRawGithubWorkflowRunId(x: unknown): GithubWorkflowRunId {
  const cicadaRunId = `${GITHUB_WORKFLOW_RUN_ID_PREFIX}${x}`
  if (!isGithubWorkflowRunId(cicadaRunId)) {
    throw new Error(`Invalid raw github workflow run id: ${x}`)
  }
  return cicadaRunId
}
