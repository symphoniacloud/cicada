import { mergeOrderedLists } from '../../util/collections'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { GithubPush } from '../types/GithubPush'
import { AppState } from '../../environment/AppState'
import { queryRunsAndPushesForRepo } from '../entityStore/entities/GithubWorkflowRunEntity'
import { GithubRepoKey } from '../types/GithubKeys'

// GithubActivity is a domain concept that is only read, not written, since it's
// only used when runs and pushes are read from the database at the same time.

export type GithubActivity = GithubWorkflowRunEventActivity | GithubPushActivity

export interface GithubWorkflowRunEventActivity {
  activityType: 'workflowRunEvent'
  event: GithubWorkflowRunEvent
}

export interface GithubPushActivity {
  activityType: 'push'
  event: GithubPush
}

export function activityIsWorkflowRunActivity(
  activity: GithubActivity
): activity is GithubWorkflowRunEventActivity {
  return activity.activityType === 'workflowRunEvent'
}

export async function getRecentActivityForRepo(appState: AppState, repoKey: GithubRepoKey) {
  const activityQueryResult = await queryRunsAndPushesForRepo(appState.entityStore, repoKey)
  return mergeOrderedLists(
    workflowRunEventsToActivities(activityQueryResult.runs),
    pushesToActivities(activityQueryResult.pushes),
    (x, y) => activityDateTime(x) > activityDateTime(y)
  )
}

function workflowRunEventsToActivities(events: GithubWorkflowRunEvent[]): GithubActivity[] {
  return events.map((event): GithubActivity => ({ activityType: 'workflowRunEvent', event }))
}

function pushesToActivities(events: GithubPush[]): GithubActivity[] {
  return events.map((event): GithubActivity => ({ activityType: 'push', event }))
}

export function activityDateTime(activity: GithubActivity) {
  return activityIsWorkflowRunActivity(activity) ? activity.event.updatedAt : activity.event.dateTime
}
