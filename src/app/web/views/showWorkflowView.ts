import { Clock } from '../../util/dateAndTime'
import { generatePageViewResultWithoutHtmx } from './viewResultWrappers'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { workflowRow } from './pageElements'

export function createShowWorkflowResponse(clock: Clock, runs: GithubWorkflowRunEvent[]) {
  if (runs.length === 0) {
    return generatePageViewResultWithoutHtmx(`
      <p>No activity found. If this is a new workflow make sure it runs first before trying to view here
`)
  }

  // TOEventually - when we have in-progress runs only show them if no corresponding completed event
  return generatePageViewResultWithoutHtmx(`
    <h3>Runs for workflow ${runs[0].workflowName} in ${runs[0].ownerName}/${runs[0].repoName}</h3>
    <table class='table'>
      <thead>
        <tr><th>Result</th><th>When</th><th>By</th><th>Commit</th></tr>
      </thead>
      <tbody>
      ${runs
        .map((event) => workflowRow(clock, event, { showRepoCell: false, showWorkflowCell: false }))
        .join('')}
      </tbody>
    </table>
`)
}
