import { fragmentViewResult } from '../../viewResultWrappers'
import { table, tbody } from '../../hiccough/hiccoughElements'
import { workflowHeader, workflowRow } from '../../domainComponents/workflowComponents'
import { Clock } from '../../../util/dateAndTime'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'

export function createHomeActionsStatusResponse(clock: Clock, workflowStatus: GithubWorkflowRunEvent[]) {
  return fragmentViewResult(homeActionsStatusElement(clock, workflowStatus))
}

export function homeActionsStatusElement(clock: Clock, workflowStatus: GithubWorkflowRunEvent[]) {
  return table(
    { class: 'table' },
    workflowHeader('allRepos'),
    tbody(...workflowStatus.map((e) => workflowRow(clock, e, 'allRepos')))
  )
}
