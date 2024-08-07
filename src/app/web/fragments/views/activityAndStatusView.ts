import { Clock } from '../../../util/dateAndTime'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'
import { fragmentViewResult } from '../../viewResultWrappers'
import { standardTable } from '../../domainComponents/genericComponents'
import { GithubPush } from '../../../domain/types/GithubPush'
import { pushRow, PushRowOptions } from '../../domainComponents/pushComponents'
import { activityIsWorkflowRunActivity, GithubActivity } from '../../../domain/github/githubActivity'
import { HiccoughElement } from '../../hiccough/hiccoughElement'
import { i, p } from '../../hiccough/hiccoughElements'
import { workflowRow, WorkflowRowOptions } from '../../domainComponents/workflowComponents'

export type WorkflowRunEventTableType = 'homeStatus' | 'repoStatus' | 'workflowActivity'
export type GithubPushTableType = 'homeActivity'
export type GithubActivityTableType = 'repoActivity'

export function createWorkflowRunEventTableResponse(
  mode: WorkflowRunEventTableType,
  clock: Clock,
  events: GithubWorkflowRunEvent[]
) {
  return createResponse(
    mode,
    events.map((event) => workflowRowForMode(mode, clock, event))
  )
}

export function createGithubPushTableResponse(mode: GithubPushTableType, clock: Clock, pushes: GithubPush[]) {
  return createResponse(
    mode,
    pushes.map((push) => pushRowForMode(mode, clock, push))
  )
}

export function createGithubActivityResponse(
  mode: GithubActivityTableType,
  clock: Clock,
  activity: GithubActivity[]
) {
  return createResponse(
    mode,
    activity.map((event) =>
      activityIsWorkflowRunActivity(event)
        ? workflowRowForMode(mode, clock, event.event)
        : pushRowForMode(mode, clock, event.event)
    )
  )
}

type TableType = WorkflowRunEventTableType | GithubPushTableType | GithubActivityTableType
const columnTitles: Record<TableType, string[]> = {
  homeStatus: ['Repo', 'Workflow', 'Status', 'When', 'Duration', 'By', 'Commit'],
  homeActivity: ['Repo', 'Branch', 'When', 'By', 'Commit'],
  repoStatus: ['Workflow', 'Status', 'When', 'Duration', 'By', 'Commit'],
  repoActivity: ['Type', 'Activity', 'When', 'By', 'Commit'],
  workflowActivity: ['Result', 'When', 'Elapsed time', 'By', 'Commit']
}

function createResponse(mode: TableType, rows: HiccoughElement[]) {
  return fragmentViewResult(
    rows.length === 0 ? p(i('No data available')) : standardTable(columnTitles[mode], rows)
  )
}

type WorkflowRowMode = WorkflowRunEventTableType | GithubActivityTableType
const workflowRowConfig: Record<WorkflowRowMode, WorkflowRowOptions> = {
  homeStatus: { showRepo: true, showWorkflow: true, showElapsed: true },
  repoStatus: { showWorkflow: true, showElapsed: true },
  repoActivity: { showDescription: true, showWorkflow: true },
  workflowActivity: { showElapsed: true }
}

export function workflowRowForMode(mode: WorkflowRowMode, clock: Clock, event: GithubWorkflowRunEvent) {
  return workflowRow(clock, event, workflowRowConfig[mode])
}

type PushRowMode = GithubPushTableType | GithubActivityTableType
const pushRowConfig: Record<PushRowMode, PushRowOptions> = {
  homeActivity: { showDescription: false, showRepo: true },
  repoActivity: { showDescription: true, showRepo: false }
}

export function pushRowForMode(mode: PushRowMode, clock: Clock, push: GithubPush) {
  return pushRow(clock, push, pushRowConfig[mode])
}
