import { mergeOrderedLists } from '../../util/collections'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { GithubPush } from '../types/GithubPush'
import { AppState } from '../../environment/AppState'
import { githubWorkflowRunEventGsiSkPrefix } from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { GithubPushEntity } from '../entityStore/entities/GithubPushEntity'
import { rangeWhereSkBeginsWith } from '@symphoniacloud/dynamodb-entity-store'
import { pushesFromMultipleEntityResponse } from './githubPush'
import { GithubWorkflowRunEntity } from '../entityStore/entities/GithubWorkflowRunEntity'
import { workflowRunsFromMultipleEventEntityResponse } from './githubWorkflowRun'
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

// Workflow Runs and Pushes deliberately use the same GSI key format so that they can be queried
// in one call. dynamdb-entity-store supports converting records for different entities during
// a query by using the `forMultiple` function
export async function getRecentActivityForRepo(appState: AppState, repoKey: GithubRepoKey) {
  const activityResponse = await appState.entityStore
    .forMultiple([GithubWorkflowRunEntity, GithubPushEntity])
    .queryOnePageWithGsiByPkAndSk(
      GithubWorkflowRunEntity,
      repoKey,
      // Workflow Run *events* will also be returned by the DynamoDB query, but the entity-store
      // filters them out because the entity isn't specified in the 'forMultiple()' array
      rangeWhereSkBeginsWith(githubWorkflowRunEventGsiSkPrefix(repoKey)),
      {
        scanIndexForward: false
      }
    )

  return mergeOrderedLists(
    workflowRunEventsToActivities(workflowRunsFromMultipleEventEntityResponse(activityResponse)),
    pushesToActivities(pushesFromMultipleEntityResponse(activityResponse)),
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
