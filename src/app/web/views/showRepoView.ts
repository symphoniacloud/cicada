import { Clock } from '../../util/dateAndTime'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../domain/github/githubActivity'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { githubAnchor } from '../domainComponents/genericComponents'
import { GithubRepository } from '../../domain/types/GithubRepository'
import { h3, h4, table, tbody } from '../hiccough/hiccoughElements'
import { pageViewResultWithoutHtmx } from './viewResultWrappers'
import { workflowHeader, workflowRow } from '../domainComponents/workflowComponents'
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
      workflowHeader('repoStatus'),
      tbody(...workflowStatus.map((event) => workflowRow(clock, event, 'repoStatus')))
    ),
    h4('Recent Activity'),
    table(
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
  ]

  return pageViewResultWithoutHtmx(contents)
}
