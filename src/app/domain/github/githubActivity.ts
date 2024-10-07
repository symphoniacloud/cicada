import { mergeOrderedLists } from '../../util/collections'
import { FullGithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { GithubPush } from '../types/GithubPush'
import { AppState } from '../../environment/AppState'
import { queryRunsAndPushesForRepo } from '../entityStore/entities/GithubWorkflowRunEntity'
import { GithubRepoKey } from '../types/GithubKeys'
import { toFullWorkflowRunEvent } from './githubWorkflowRunEvent'
import { UserScopeReferenceData } from '../types/UserScopeReferenceData'

// GithubActivity is a domain concept that is only read, not written, since it's
// only used when runs and pushes are read from the database at the same time.

export type GithubActivity = FullGithubWorkflowRunEventActivity | GithubPushActivity

export interface FullGithubWorkflowRunEventActivity {
  activityType: 'fullWorkflowRunEvent'
  event: FullGithubWorkflowRunEvent
}

export interface GithubPushActivity {
  activityType: 'push'
  event: GithubPush
}

export function activityIsFullWorkflowRunActivity(
  activity: GithubActivity
): activity is FullGithubWorkflowRunEventActivity {
  return activity.activityType === 'fullWorkflowRunEvent'
}

export async function getRecentActivityForRepo(
  appState: AppState,
  refData: UserScopeReferenceData,
  repoKey: GithubRepoKey
) {
  const activityQueryResult = await queryRunsAndPushesForRepo(appState.entityStore, repoKey)
  return mergeOrderedLists(
    fullWorkflowRunEventsToActivities(
      activityQueryResult.runs.map((run) => toFullWorkflowRunEvent(refData, run))
    ),
    pushesToActivities(activityQueryResult.pushes),
    (x, y) => activityDateTime(x) > activityDateTime(y)
  )
}

function fullWorkflowRunEventsToActivities(events: FullGithubWorkflowRunEvent[]): GithubActivity[] {
  return events.map((event): GithubActivity => ({ activityType: 'fullWorkflowRunEvent', event }))
}

function pushesToActivities(events: GithubPush[]): GithubActivity[] {
  return events.map((event): GithubActivity => ({ activityType: 'push', event }))
}

export function activityDateTime(activity: GithubActivity) {
  return activityIsFullWorkflowRunActivity(activity)
    ? activity.event.runEventUpdatedAt
    : activity.event.dateTime
}
