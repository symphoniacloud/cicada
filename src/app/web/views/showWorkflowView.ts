import { Clock } from '../../util/dateAndTime'
import { pageViewResultWithoutHtmx } from './viewResultWrappers'
import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { h3, p, table, tbody } from '../hiccough/hiccoughElements'
import { workflowHeader, workflowRow } from '../domainComponents/workflowComponents'

export function createShowWorkflowResponse(clock: Clock, runs: GithubWorkflowRunEvent[]) {
  const structure =
    runs.length === 0
      ? [p('No activity found. If this is a new workflow make sure it runs first before trying to view here')]
      : [
          h3(`Runs for workflow ${runs[0].workflowName} in ${runs[0].ownerName}/${runs[0].repoName}`),
          // TOEventually - when we have in-progress runs only show them if no corresponding completed event
          table(
            { class: 'table' },
            workflowHeader('workflowActivity'),
            tbody(...runs.map((run) => workflowRow(clock, run, 'workflowActivity')))
          )
        ]

  return pageViewResultWithoutHtmx(structure)
}
