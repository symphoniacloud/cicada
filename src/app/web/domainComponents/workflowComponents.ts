import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { githubAnchor } from './genericComponents'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { runWasSuccessful } from '../../domain/github/githubWorkflowRunEvent'
import { userCell } from './userComponents'

export type WorkflowRowOptions = {
  showDescription?: boolean
  showRepo?: boolean
  showWorkflow?: boolean
}

export function workflowRow(
  clock: Clock,
  workflowRunEvent: GithubWorkflowRunEvent,
  options?: WorkflowRowOptions
) {
  const { showDescription, showRepo, showWorkflow } = {
    showDescription: false,
    showRepo: false,
    showWorkflow: false,
    ...options
  }

  const runSuccessful = runWasSuccessful(workflowRunEvent)
  return tr(
    { class: runSuccessful ? 'success' : 'danger' },
    showDescription ? (runSuccessful ? successfulRunDescriptionCell : failedRunDescriptionCell) : undefined,
    showRepo ? repoCell(workflowRunEvent) : undefined,
    showWorkflow ? workflowCell(workflowRunEvent) : undefined,
    showDescription ? undefined : runSuccessful ? successfulRunResultCell : failedRunResultCell,
    td(displayDateTime(clock, workflowRunEvent.updatedAt), '&nbsp;', githubAnchor(workflowRunEvent.htmlUrl)),
    userCell(workflowRunEvent.actor),
    commitCell({
      ...workflowRunEvent,
      sha: workflowRunEvent.headSha,
      message: workflowRunEvent.displayTitle
    })
  )
}

const successfulRunDescriptionCell = td('Successful Run')
const failedRunDescriptionCell = td('Failed Run')
const successfulRunResultCell = td('Success')
const failedRunResultCell = td('Failed')

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
