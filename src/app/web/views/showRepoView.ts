import { Clock } from '../../util/dateAndTime'
import { GithubActivity } from '../../domain/github/githubActivity'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubRepository } from '../../domain/types/GithubRepository'
import { h4 } from '../hiccough/hiccoughElements'
import { pageViewResultWithoutHtmx } from './viewResultWrappers'
import { repoHeadingElement } from './repoHeadingView'
import { repoActionsStatusElement } from './repoActionsStatusView'
import { repoRecentActivityElement } from './repoRecentActivityView'

export function createShowRepoResponse(
  clock: Clock,
  repo: GithubRepository,
  workflowStatus: GithubWorkflowRunEvent[],
  activity: GithubActivity[]
) {
  const contents = [
    repoHeadingElement(repo),
    h4('GitHub Actions Status'),
    repoActionsStatusElement(clock, workflowStatus),
    h4('Recent Activity'),
    repoRecentActivityElement(clock, activity)
  ]

  return pageViewResultWithoutHtmx(contents)
}
