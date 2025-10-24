import { Clock } from '../../../util/dateAndTime.js'
import { fragmentViewResult } from '../../viewResultWrappers.js'
import { standardTable } from '../../domainComponents/genericComponents.js'
import { GithubPush } from '../../../domain/types/GithubPush.js'
import { pushRow, PushRowOptions } from '../../domainComponents/pushComponents.js'
import { activityIsFullWorkflowRunActivity } from '../../../domain/github/githubActivity.js'
import { HiccoughElement } from '../../hiccough/hiccoughElement.js'
import { a, i, p } from '../../hiccough/hiccoughElements.js'
import { workflowRow, WorkflowRowOptions } from '../../domainComponents/workflowComponents.js'
import {
  VisibleActivity,
  VisiblePushes,
  VisibleFullWorkflowRunEvents
} from '../../../domain/user/userVisible.js'
import { FullGitHubWorkflowRunEvent } from '../../../types/GitHubTypes.js'

export type WorkflowRunEventTableType = 'homeStatus' | 'accountStatus' | 'repoStatus' | 'workflowActivity'
export type GithubPushTableType = 'homeActivity' | 'accountActivity'
export type GithubActivityTableType = 'repoActivity'

export function createWorkflowRunEventTableResponse(
  mode: WorkflowRunEventTableType,
  clock: Clock,
  events: VisibleFullWorkflowRunEvents
) {
  return createResponse(
    mode,
    events.visibleEvents.map((event) => workflowRowForMode(mode, clock, event)),
    events.someEventsHidden
  )
}

export function createGithubPushTableResponse(
  mode: GithubPushTableType,
  clock: Clock,
  pushes: VisiblePushes
) {
  return createResponse(
    mode,
    pushes.visibleEvents.map((push) => pushRowForMode(mode, clock, push)),
    pushes.someEventsHidden
  )
}

export function createGithubActivityResponse(
  mode: GithubActivityTableType,
  clock: Clock,
  activity: VisibleActivity
) {
  return createResponse(
    mode,
    activity.visibleEvents.map((event) =>
      activityIsFullWorkflowRunActivity(event)
        ? workflowRowForMode(mode, clock, event.event)
        : pushRowForMode(mode, clock, event.event)
    ),
    activity.someEventsHidden
  )
}

type TableType = WorkflowRunEventTableType | GithubPushTableType | GithubActivityTableType
const columnTitles: Record<TableType, string[]> = {
  homeStatus: ['Repo', 'Workflow', 'Status', 'When', 'Duration', 'By', 'Commit'],
  homeActivity: ['Repo', 'Branch', 'When', 'By', 'Commit'],
  accountStatus: ['Repo', 'Workflow', 'Status', 'When', 'Duration', 'By', 'Commit'],
  accountActivity: ['Repo', 'Branch', 'When', 'By', 'Commit'],
  repoStatus: ['Workflow', 'Status', 'When', 'Duration', 'By', 'Commit'],
  repoActivity: ['Type', 'Activity', 'When', 'By', 'Commit'],
  workflowActivity: ['Result', 'When', 'Elapsed time', 'By', 'Commit']
}

function createResponse(mode: TableType, rows: HiccoughElement[], someEventsHidden: boolean) {
  return fragmentViewResult(...createResponseContent(mode, rows, someEventsHidden))
}

const USER_SETTINGS_LINK = a('/userSettings', 'user settings')
const NO_DATA_AVAILABLE_MESSAGE = p(i('No data available'))
const ALL_DATA_HIDDEN_MESSAGE = p(i('No data visible because of your ', USER_SETTINGS_LINK))
const SOME_DATA_HIDDEN_MESSAGE = p(i('Some data hidden because of your ', USER_SETTINGS_LINK))

function createResponseContent(mode: TableType, rows: HiccoughElement[], someEventsHidden: boolean) {
  if (rows.length === 0) {
    return [someEventsHidden ? ALL_DATA_HIDDEN_MESSAGE : NO_DATA_AVAILABLE_MESSAGE]
  }

  const resultsTable = standardTable(columnTitles[mode], rows)
  return someEventsHidden ? [resultsTable, SOME_DATA_HIDDEN_MESSAGE] : [resultsTable]
}

type WorkflowRowMode = WorkflowRunEventTableType | GithubActivityTableType
const workflowRowConfig: Record<WorkflowRowMode, WorkflowRowOptions> = {
  homeStatus: { showRepo: true, showWorkflow: true, showElapsed: true },
  accountStatus: { showRepo: true, showWorkflow: true, showElapsed: true },
  repoStatus: { showWorkflow: true, showElapsed: true },
  repoActivity: { showDescription: true, showWorkflow: true },
  workflowActivity: { showElapsed: true }
}

export function workflowRowForMode(mode: WorkflowRowMode, clock: Clock, event: FullGitHubWorkflowRunEvent) {
  return workflowRow(clock, event, workflowRowConfig[mode])
}

type PushRowMode = GithubPushTableType | GithubActivityTableType
const pushRowConfig: Record<PushRowMode, PushRowOptions> = {
  homeActivity: { showDescription: false, showRepo: true },
  accountActivity: { showDescription: false, showRepo: true },
  repoActivity: { showDescription: true, showRepo: false }
}

export function pushRowForMode(mode: PushRowMode, clock: Clock, push: GithubPush) {
  return pushRow(clock, push, pushRowConfig[mode])
}
