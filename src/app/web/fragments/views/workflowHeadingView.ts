import { fragmentViewResult } from '../../viewResultWrappers'
import { h3, p } from '../../hiccough/hiccoughElements'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'

export function createWorkflowHeadingResponse(run?: GithubWorkflowRunEvent) {
  return fragmentViewResult(workflowHeadingElement(run))
}

export function workflowHeadingElement(run?: GithubWorkflowRunEvent) {
  // TODO - better formatting and GitHub link
  return run
    ? h3(`Runs for workflow ${run.workflowName} in ${run.ownerName}/${run.repoName}`)
    : p('No activity found. If this is a new workflow make sure it runs first before trying to view here')
}
