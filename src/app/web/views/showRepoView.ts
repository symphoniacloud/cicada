import { Clock } from '../../util/dateAndTime'
import { generatePageViewResultWithoutHtmx } from './viewResultWrappers'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../domain/github/githubActivity'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import {
  branchCell,
  cell,
  commitCellForPush,
  commitCellForWorkflowRunEvent,
  githubAnchor,
  githubRepoUrl,
  plainDateTimeCell,
  userCell,
  workflowCell,
  workflowRow
} from './pageElements'
import { runWasSuccessful } from '../../domain/github/githubWorkflowRunEvent'
import { GithubRepository } from '../../domain/types/GithubRepository'

export function createShowRepoResponse(
  clock: Clock,
  repo: GithubRepository,
  workflowStatus: GithubWorkflowRunEvent[],
  activity: GithubActivity[]
) {
  return generatePageViewResultWithoutHtmx(`
    <h3>Repository: ${repo.ownerName}/${repo.name}&nbsp;&nbsp;${githubAnchor(
    githubRepoUrl({
      ...repo,
      repoName: repo.name
    })
  )}</h3>
    <h4>GitHub Actions Status</h4>
    <table class='table'>
      <thead>
        <tr><th>Workflow</th><th>Status</th><th>When</th><th>By</th><th>Commit</th></tr>
      </thead>
      <tbody>
      ${workflowStatus
        .map((event) =>
          workflowRow(clock, event, {
            showRepoCell: false,
            showWorkflowCell: true
          })
        )
        .join('')}
      </tbody>
    </table>    
    <h4>Recent Activity</h4>
    <table class='table'>
      <thead>
        <tr><th>Type</th><th>Activity</th><th>When</th><th>By</th><th>Commit</th></tr>
      </thead>
      <tbody>
      ${activity.map((event) => activityRow(clock, event)).join('')}
      </tbody>
    </table>
`)
}

function activityRow(clock: Clock, event: GithubActivity) {
  if (activityIsWorkflowRunActivity(event)) {
    const workflowRun = event.event
    const wasSuccessful = runWasSuccessful(workflowRun)
    return `<tr class='${wasSuccessful ? 'success' : 'danger'}'>
        ${cell(wasSuccessful ? 'Successful Run' : 'Failed Run')}
        ${workflowCell(workflowRun)}
        ${plainDateTimeCell(clock, { dateTime: workflowRun.updatedAt })}
        ${userCell(workflowRun.actor)}
        ${commitCellForWorkflowRunEvent(workflowRun)}
      </tr>`
  } else {
    const push = event.event
    return `<tr class='info'}'>
        ${cell('Push')}
        ${branchCell(push)}
        ${plainDateTimeCell(clock, push)}
        ${userCell(push.actor)}
        ${commitCellForPush(push)}
      </tr>`
  }
}
