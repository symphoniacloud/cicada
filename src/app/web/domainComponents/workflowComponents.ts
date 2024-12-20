import { FullGithubWorkflowRunEvent, GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { Clock, displayDateTime, durationAsStringFromMs } from '../../util/dateAndTime'
import { githubAnchor } from './genericComponents'
import { commitCell, repoCell } from './repoElementComponents'
import { elapsedTimeMs, runBasicStatus, WorkflowRunStatus } from '../../domain/github/githubWorkflowRunEvent'
import { userCell } from './userComponents'
import { removeNullAndUndefined } from '../../util/collections'

export type WorkflowRowOptions = {
  showDescription?: boolean
  showRepo?: boolean
  showWorkflow?: boolean
  showElapsed?: boolean
}

const runStatusRowClass: Record<WorkflowRunStatus, string> = {
  '✅': 'table-success',
  '❌': 'table-danger',
  '⏳': 'table-warning'
}

export function workflowRow(clock: Clock, event: FullGithubWorkflowRunEvent, options: WorkflowRowOptions) {
  const { showDescription, showRepo, showWorkflow, showElapsed } = {
    showDescription: false,
    showRepo: false,
    showWorkflow: false,
    showElapsed: false,
    ...options
  }

  const runStatus = runBasicStatus(event)
  const rowClass = runStatusRowClass[runStatus]

  const cells = removeNullAndUndefined([
    showDescription ? td(description(runStatus, event)) : undefined,
    showRepo ? repoCell(event) : undefined,
    showWorkflow ? workflowCell(event) : undefined,
    showDescription ? undefined : td(statusMessage(runStatus, event)),
    td(displayDateTime(clock, event.runEventUpdatedAt), '&nbsp;', githubAnchor(event.runHtmlUrl)),
    showElapsed ? td(durationAsStringFromMs(elapsedTimeMs(event))) : undefined,
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

function workflowCell(event: FullGithubWorkflowRunEvent) {
  return td(
    a(
      `/workflow?accountId=${event.accountId}&repoId=${event.repoId}&workflowId=${event.workflowId}`,
      event.workflowName
    ),
    '&nbsp;',
    githubAnchor(event.workflowHtmlUrl)
  )
}
