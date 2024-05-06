import { Clock } from '../../util/dateAndTime'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../domain/github/githubActivity'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { githubAnchor } from '../domainComponents/genericComponents'
import { GithubRepository } from '../../domain/types/GithubRepository'
import { h3, h4, table, tbody, th, thead, tr } from '../hiccough/hiccoughElements'
import { pageViewResultWithoutHtmx } from './viewResultWrappers'
import { workflowRow } from '../domainComponents/workflowComponents'
import { pushRow } from '../domainComponents/pushComponents'
import { githubRepoUrl } from '../domainComponents/repoElementComponents'

export function createShowRepoResponse(
  clock: Clock,
  repo: GithubRepository,
  workflowStatus: GithubWorkflowRunEvent[],
  activity: GithubActivity[]
) {
  const contents = [
    h3(
      `Repository: ${repo.ownerName}/${repo.name}`,
      `&nbsp;`,
      githubAnchor(
        githubRepoUrl({
          ...repo,
          repoName: repo.name
        })
      )
    ),
    h4('GitHub Actions Status'),
    table(
      { class: 'table' },
      thead(tr(...['Workflow', 'Status', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(
        ...workflowStatus.map((event) =>
          workflowRow(clock, event, {
            showWorkflowCell: true
          })
        )
      )
    ),
    h4('Recent Activity'),
    table(
      { class: 'table' },
      thead(tr(...['Type', 'Activity', 'When', 'By', 'Commit'].map((x) => th(x)))),
      tbody(
        ...activity.map((event) =>
          activityIsWorkflowRunActivity(event)
            ? workflowRow(clock, event.event, {
                showDescriptionCell: true,
                showWorkflowCell: true
              })
            : pushRow(clock, event.event, { showDescriptionCell: true })
        )
      )
    )
  ]

  return pageViewResultWithoutHtmx(contents)
}
