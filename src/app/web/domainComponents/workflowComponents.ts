import { a, td, tr } from '@symphoniacloud/hiccough'
import { Clock, displayDateTime, durationAsStringFromMs } from '../../util/dateAndTime.js'
import { githubAnchor } from './genericComponents.js'
import { commitCell, repoCell } from './repoElementComponents.js'
import {
  elapsedTimeMs,
  runBasicStatus,
  WorkflowRunStatus
} from '../../domain/github/githubWorkflowRunEvent.js'
import { userCell } from './userComponents.js'
import { removeNullAndUndefined } from '../../util/collections.js'
import { GitHubWorkflowRunEvent } from '../../ioTypes/GitHubTypes.js'
import { FullGitHubWorkflowRunEvent } from '../../domain/types/internalTypes.js'

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

export function workflowRow(clock: Clock, event: FullGitHubWorkflowRunEvent, options: WorkflowRowOptions) {
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

function description(status: WorkflowRunStatus, event: GitHubWorkflowRunEvent) {
  if (status === '✅') return 'Successful Run'
  if (status === '❌') return `Failed Run${descriptionOrMessageSuffix(status, event)}`
  return `In Progress Run${descriptionOrMessageSuffix(status, event)}`
}

function statusMessage(status: WorkflowRunStatus, event: GitHubWorkflowRunEvent) {
  if (status === '✅') return 'Success'
  if (status === '❌') return `Failure${descriptionOrMessageSuffix(status, event)}`
  return `In Progress${descriptionOrMessageSuffix(status, event)}`
}

function descriptionOrMessageSuffix(status: WorkflowRunStatus, event: GitHubWorkflowRunEvent) {
  if (status === '✅') return ''
  if (status === '❌') return event.conclusion === 'failure' ? '' : ` (${event.conclusion})`
  return event.status === 'in_progress' ? '' : ` (${event.status})`
}

function workflowCell(event: FullGitHubWorkflowRunEvent) {
  return td(
    a(
      `/workflow?accountId=${event.accountId}&repoId=${event.repoId}&workflowId=${event.workflowId}`,
      event.workflowName
    ),
    '&nbsp;',
    githubAnchor(event.workflowHtmlUrl)
  )
}
