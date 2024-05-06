import { fragmentViewResult } from './viewResultWrappers'
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
import { div, h3, table, tbody, th, thead, tr } from '../hiccough/hiccoughElements'

export function createShowLatestActivityResponse(
  clock: Clock,
  workflowStatus: GithubWorkflowRunEvent[],
  recentPushes: GithubPush[]
) {
  const contents = div(
    { id: 'latestActivity', class: 'container-fluid' },
    h3('GitHub Actions Status'),
    table(
      { class: 'table' },
      thead(tr(...['Repo', 'Workflow', 'Status', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(...workflowStatus.map((e) => workflowRow(clock, e)))
    ),
    h3('Recent Branch Activity'),
    table(
      { class: 'table' },
      thead(tr(...['Repo', 'Branch', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(...recentPushes.map((x) => pushRow(clock, x)))
    )
  )

  return fragmentViewResult(contents)
}

function pushRow(clock: Clock, push: GithubPush) {
  return tr(
    { class: 'info' },
    repoCellForPush(push),
    branchCell(push),
    plainDateTimeCell(clock, push),
    userCell(push.actor),
    commitCellForPush(push)
  )
}
