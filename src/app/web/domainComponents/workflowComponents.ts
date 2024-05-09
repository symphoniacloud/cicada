import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { githubAnchor } from './genericComponents'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { runBasicStatus, WorkflowRunStatus } from '../../domain/github/githubWorkflowRunEvent'
import { userCell } from './userComponents'
import { removeNullAndUndefined } from '../../util/collections'

export type WorkflowRowMode = 'allRepos' | 'repoStatus' | 'repoActivity' | 'workflowActivity'

type WorkflowRowOptions = {
  showDescription?: boolean
  showRepo?: boolean
  showWorkflow?: boolean
}

const rowConfig: Record<WorkflowRowMode, WorkflowRowOptions> = {
  allRepos: { showRepo: true, showWorkflow: true },
  repoStatus: { showWorkflow: true },
  repoActivity: { showDescription: true, showWorkflow: true },
  workflowActivity: {}
}

export function workflowRow(clock: Clock, event: GithubWorkflowRunEvent, mode: WorkflowRowMode) {
  return workflowRowWithOptions(clock, event, rowConfig[mode])
}

const runStatusRowClass: Record<WorkflowRunStatus, string> = {
  '✅': 'success',
  '❌': 'danger',
  '⏳': 'warning'
}

export function workflowRowWithOptions(
  clock: Clock,
  event: GithubWorkflowRunEvent,
  options: WorkflowRowOptions
) {
  const { showDescription, showRepo, showWorkflow } = {
    showDescription: false,
    showRepo: false,
    showWorkflow: false,
    ...options
  }

  const runStatus = runBasicStatus(event)
  const rowClass = runStatusRowClass[runStatus]

  const cells = removeNullAndUndefined([
    showDescription ? td(description(runStatus, event)) : undefined,
    showRepo ? repoCell(event) : undefined,
    showWorkflow ? workflowCell(event) : undefined,
    showDescription ? undefined : td(statusMessage(runStatus, event)),
    td(displayDateTime(clock, event.updatedAt), '&nbsp;', githubAnchor(event.htmlUrl)),
    userCell(event.actor),
    commitCell({
      ...event,
      sha: event.headSha,
      message: event.displayTitle
    })
  ])

  return tr({ class: rowClass }, ...cells)
}

function description(status: WorkflowRunStatus, event: GithubWorkflowRunEvent) {
  if (status === '✅') return 'Successful Run'
  if (status === '❌') return `Failed Run${descriptionOrMessageSuffix(status, event)}`
  return `In Progress Run${descriptionOrMessageSuffix(status, event)}`
}

function statusMessage(status: WorkflowRunStatus, event: GithubWorkflowRunEvent) {
  if (status === '✅') return 'Success'
  if (status === '❌') return `Failure${descriptionOrMessageSuffix(status, event)}`
  return `In Progress${descriptionOrMessageSuffix(status, event)}`
}

function descriptionOrMessageSuffix(status: WorkflowRunStatus, event: GithubWorkflowRunEvent) {
  if (status === '✅') return ''
  if (status === '❌') return event.conclusion === 'failure' ? '' : ` (${event.conclusion})`
  return event.status === 'in_progress' ? '' : ` (${event.status})`
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
