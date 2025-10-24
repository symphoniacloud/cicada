import { mergeOrderedLists } from '../../util/collections.js'
import { FullGithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent.js'
import { GithubPush } from '../types/GithubPush.js'
import { AppState } from '../../environment/AppState.js'
import { queryRunsAndPushesForRepo } from '../entityStore/entities/GithubWorkflowRunEntity.js'
import { toFullWorkflowRunEvent } from './githubWorkflowRunEvent.js'
import { UserScopeReferenceData } from '../types/UserScopeReferenceData.js'
import { GitHubRepoKey } from '../../types/GitHubTypes.js'

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
  repoKey: GitHubRepoKey
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
