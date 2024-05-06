import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { githubAnchor } from './genericComponents'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { runWasSuccessful } from '../../domain/github/githubWorkflowRunEvent'
import { userCell } from './userComponents'

export type WorkflowRowOptions = {
  showDescriptionCell?: boolean
  showRepoCell?: boolean
  showWorkflowCell?: boolean
}

export function workflowRow(
  clock: Clock,
  workflowRunEvent: GithubWorkflowRunEvent,
  options?: WorkflowRowOptions
) {
  const { showDescriptionCell, showRepoCell, showWorkflowCell } = {
    showDescriptionCell: false,
    showRepoCell: false,
    showWorkflowCell: false,
    ...options
  }

  return tr(
    { class: workflowRunClass(workflowRunEvent) },
    showDescriptionCell ? descriptionCell(workflowRunEvent) : undefined,
    showRepoCell ? repoCell(workflowRunEvent) : undefined,
    showWorkflowCell ? workflowCell(workflowRunEvent) : undefined,
    showDescriptionCell ? undefined : workflowResultCell(workflowRunEvent),
    workflowRunCell(clock, workflowRunEvent),
    userCell(workflowRunEvent.actor),
    commitCellForWorkflowRunEvent(workflowRunEvent)
  )
}

export function workflowRunClass(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  return runWasSuccessful(event) ? 'success' : 'danger'
}

export function descriptionCell(event: GithubWorkflowRunEvent) {
  return runWasSuccessful(event) ? successfulRunDescriptionCell : failedRunDescriptionCell
}

const successfulRunDescriptionCell = td('Successful Run')
const failedRunDescriptionCell = td('Failed Run')

export function workflowCell(
  event: GithubRepositoryElement &
    Pick<GithubWorkflowRunEvent, 'workflowHtmlUrl' | 'workflowId' | 'workflowName' | 'path'>
) {
  const workflowPath = `${event.path.substring(event.path.indexOf('/') + 1)}`
  return td(
    a(
      `/app/account/${event.ownerId}/repo/${event.repoId}/workflow/${event.workflowId}`,
      event.workflowName ?? workflowPath
    ),
    '&nbsp;',
    githubAnchor(event.workflowHtmlUrl ?? `${githubRepoUrl(event)}/actions/${workflowPath}`)
  )
}

export function workflowResultCell(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  return runWasSuccessful(event) ? successfulRunResultCell : failedRunResultCell
}

const successfulRunResultCell = td('Success')
const failedRunResultCell = td('Failed')

export function workflowRunCell(clock: Clock, event: GithubWorkflowRunEvent) {
  return td(displayDateTime(clock, event.updatedAt), '&nbsp;', githubAnchor(event.htmlUrl))
}

export function commitCellForWorkflowRunEvent(event: GithubWorkflowRunEvent) {
  return commitCell({
    ...event,
    sha: event.headSha,
    message: event.displayTitle
  })
}
