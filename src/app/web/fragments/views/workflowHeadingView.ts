import { fragmentViewResult } from '../../viewResultWrappers.js'
import { h3, p } from '@symphoniacloud/hiccough'

import { GitHubWorkflowRunEvent } from '../../../ioTypes/GitHubTypes.js'

export function createWorkflowHeadingResponse(run?: GitHubWorkflowRunEvent) {
  return fragmentViewResult(workflowHeadingElement(run))
}

export function workflowHeadingElement(run?: GitHubWorkflowRunEvent) {
  // TODO - better formatting and GitHub link
  return run
    ? h3(`Runs for workflow ${run.workflowName} in ${run.accountName}/${run.repoName}`)
    : p('No activity found. If this is a new workflow make sure it runs first before trying to view here')
}
