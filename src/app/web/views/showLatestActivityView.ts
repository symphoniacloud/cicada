import { generateFragmentViewResult } from './viewResultWrappers'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../domain/types/GithubPush'
import { Clock } from '../../util/dateAndTime'
import {
  branchCell,
  commitCellForPush,
  plainDateTimeCell,
  repoCellForPush,
  userCell,
  workflowRow
} from './pageElements'

export function createShowLatestActivityResponse(
  clock: Clock,
  workflowStatus: GithubWorkflowRunEvent[],
  recentPushes: GithubPush[]
) {
  return generateFragmentViewResult(`  <div id='latestActivity' class='container-fluid'>
    <h3>GitHub Actions Status</h3>
    <table class='table'>
      <thead>
        <tr><th>Repo</th><th>Workflow</th><th>Status</th><th>When</th><th>By</th><th>Commit</th></tr>
      </thead>
      <tbody>
      ${workflowStatus.map((event) => workflowRow(clock, event)).join('')}
      </tbody>
    </table>
    <h3>Recent Branch Activity</h3>
    <table class='table'>
      <thead>
        <tr><th>Repo</th><th>Branch</th><th>When</th><th>By</th><th>Commit</th></tr>
      </thead>
      <tbody>
      ${recentPushes.map((event) => pushRow(clock, event)).join('')}
      </tbody>
    </table>
  </div>`)
}

function pushRow(clock: Clock, push: GithubPush) {
  return `<tr class='info'>
        ${repoCellForPush(push)}
        ${branchCell(push)}
        ${plainDateTimeCell(clock, push)}
        ${userCell(push.actor)}
        ${commitCellForPush(push)}
      </tr>`
}
