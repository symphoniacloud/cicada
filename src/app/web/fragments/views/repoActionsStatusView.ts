import { fragmentViewResult } from '../../viewResultWrappers'
import { table, tbody } from '../../hiccough/hiccoughElements'
import { workflowHeader, workflowRow } from '../../domainComponents/workflowComponents'
import { Clock } from '../../../util/dateAndTime'
import { GithubWorkflowRunEvent } from '../../../domain/types/GithubWorkflowRunEvent'

export function createRepoActionsStatusResponse(clock: Clock, workflowStatus: GithubWorkflowRunEvent[]) {
  return fragmentViewResult(repoActionsStatusElement(clock, workflowStatus))
}

export function repoActionsStatusElement(clock: Clock, workflowStatus: GithubWorkflowRunEvent[]) {
  return table(
    { class: 'table' },
    workflowHeader('repoStatus'),
    tbody(...workflowStatus.map((event) => workflowRow(clock, event, 'repoStatus')))
  )
}
