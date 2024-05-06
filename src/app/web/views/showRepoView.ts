import { Clock } from '../../util/dateAndTime'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../domain/github/githubActivity'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import {
  branchCell,
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
import { h3, h4, table, tbody, td, th, thead, tr } from '../hiccough/hiccoughElements'
import { inlineChildren, withOptions } from '../hiccough/hiccoughElement'
import { pageViewResultWithoutHtmx } from './viewResultWrappers'

export function createShowRepoResponse(
  clock: Clock,
  repo: GithubRepository,
  workflowStatus: GithubWorkflowRunEvent[],
  activity: GithubActivity[]
) {
  const contents = [
    withOptions(
      inlineChildren,
      h3(
        `Repository: ${repo.ownerName}/${repo.name}`,
        `&nbsp;&nbsp;`,
        githubAnchor(
          githubRepoUrl({
            ...repo,
            repoName: repo.name
          })
        )
      )
    ),
    h4('GitHub Actions Status'),
    table(
      { class: 'table' },
      thead(tr(...['Workflow', 'Status', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(
        ...workflowStatus.map((event) =>
          workflowRow(clock, event, {
            showRepoCell: false,
            showWorkflowCell: true
          })
        )
      )
    ),
    h4('Recent Activity'),
    table(
      { class: 'table' },
      thead(tr(...['Type', 'Activity', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(...activity.map((event) => activityRow(clock, event)))
    )
  ]

  return pageViewResultWithoutHtmx(contents)
}

function activityRow(clock: Clock, event: GithubActivity) {
  if (activityIsWorkflowRunActivity(event)) {
    const workflowRun = event.event
    const wasSuccessful = runWasSuccessful(workflowRun)
    return tr(
      { class: wasSuccessful ? 'success' : 'danger' },
      td(wasSuccessful ? 'Successful Run' : 'Failed Run'),
      workflowCell(workflowRun),
      plainDateTimeCell(clock, { dateTime: workflowRun.updatedAt }),
      userCell(workflowRun.actor),
      commitCellForWorkflowRunEvent(workflowRun)
    )
  } else {
    const push = event.event
    return tr(
      { class: 'info' },
      td('Push'),
      branchCell(push),
      plainDateTimeCell(clock, push),
      userCell(push.actor),
      commitCellForPush(push)
    )
  }
}
