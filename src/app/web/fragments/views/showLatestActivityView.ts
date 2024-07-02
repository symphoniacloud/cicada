import { fragmentViewResult } from '../../viewResultWrappers'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../../domain/types/GithubPush'
import { Clock } from '../../../util/dateAndTime'
import { h3, table, tbody, th, thead, tr } from '../../hiccough/hiccoughElements'
import { workflowHeader, workflowRow } from '../../domainComponents/workflowComponents'
import { pushRow } from '../../domainComponents/pushComponents'

export function createShowLatestActivityResponse(
  clock: Clock,
  workflowStatus: GithubWorkflowRunEvent[],
  recentPushes: GithubPush[]
) {
  const contents = [
    h3('GitHub Actions Status'),
    table(
      { class: 'table' },
      workflowHeader('allRepos'),
      tbody(...workflowStatus.map((e) => workflowRow(clock, e, 'allRepos')))
    ),
    h3('Recent Branch Activity'),
    table(
      { class: 'table' },
      thead(tr(...['Repo', 'Branch', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(...recentPushes.map((x) => pushRow(clock, x, { showRepo: true })))
    )
  ]

  return fragmentViewResult(...contents)
}
