import { GithubWorkflowSummary } from '../types/GithubSummaries'

export function usableWorkflowName(workflow: GithubWorkflowSummary) {
  return workflow.workflowName ?? workflow.path
}
