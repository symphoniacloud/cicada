import { fragmentViewResult } from '../../viewResultWrappers'
import { table, tbody } from '../../hiccough/hiccoughElements'
import { workflowHeader, workflowRow } from '../../domainComponents/workflowComponents'
import { Clock } from '../../../util/dateAndTime'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../../domain/github/githubActivity'
import { pushRow } from '../../domainComponents/pushComponents'

export function createRepoRecentActivityResponse(clock: Clock, activity: GithubActivity[]) {
  return fragmentViewResult(repoRecentActivityElement(clock, activity))
}

export function repoRecentActivityElement(clock: Clock, activity: GithubActivity[]) {
  return table(
    { class: 'table' },
    workflowHeader('repoActivity'),
    tbody(
      ...activity.map((event) =>
        activityIsWorkflowRunActivity(event)
          ? workflowRow(clock, event.event, 'repoActivity')
          : pushRow(clock, event.event, { showDescription: true })
      )
    )
  )
}
