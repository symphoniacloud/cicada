import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { githubAnchor } from './genericComponents'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { runBasicStatus, WorkflowRunStatus } from '../../domain/github/githubWorkflowRunEvent'
import { userCell } from './userComponents'

export type WorkflowRowOptions = {
  showDescription?: boolean
  showRepo?: boolean
  showWorkflow?: boolean
}

const runStatusFormatting: Record<
  WorkflowRunStatus,
  { rowClass: string; description: string; friendlyEventStatus: string }
> = {
  '✅': { rowClass: 'success', description: 'Successful Run', friendlyEventStatus: 'Success' },
  '❌': { rowClass: 'danger', description: 'Failed Run', friendlyEventStatus: 'Failure' },
  '⏳': { rowClass: 'warning', description: 'In Progress Run', friendlyEventStatus: 'In Progress' }
}
export function workflowRow(clock: Clock, event: GithubWorkflowRunEvent, options?: WorkflowRowOptions) {
  const { showDescription, showRepo, showWorkflow } = {
    showDescription: false,
    showRepo: false,
    showWorkflow: false,
    ...options
  }

  const { rowClass, description, friendlyEventStatus } = runStatusFormatting[runBasicStatus(event)]

  return tr(
    { class: rowClass },
    showDescription ? td(description) : undefined,
    showRepo ? repoCell(event) : undefined,
    showWorkflow ? workflowCell(event) : undefined,
    showDescription ? undefined : td(`${friendlyEventStatus}`),
    td(displayDateTime(clock, event.updatedAt), '&nbsp;', githubAnchor(event.htmlUrl)),
    userCell(event.actor),
    commitCell({
      ...event,
      sha: event.headSha,
      message: event.displayTitle
    })
  )
}

function workflowCell(
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
