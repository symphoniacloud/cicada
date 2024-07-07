import { fragmentViewResult } from '../../viewResultWrappers'
import { div, table, tbody } from '../../hiccough/hiccoughElements'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'
import { Clock } from '../../../util/dateAndTime'
import { workflowHeader, workflowRow } from '../../domainComponents/workflowComponents'

export function createWorkflowActivityResponse(clock: Clock, runs: GithubWorkflowRunEvent[]) {
  return fragmentViewResult(workflowActivityElement(clock, runs))
}

export function workflowActivityElement(clock: Clock, runs: GithubWorkflowRunEvent[]) {
  // TOEventually - when we have in-progress runs only show them if no corresponding completed event
  return runs.length === 0
    ? div()
    : table(
        { class: 'table' },
        workflowHeader('workflowActivity'),
        tbody(...runs.map((run) => workflowRow(clock, run, 'workflowActivity')))
      )
}
