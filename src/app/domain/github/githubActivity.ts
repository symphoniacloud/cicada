import { mergeOrderedLists } from '../../util/collections'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { GithubPush } from '../types/GithubPush'
import { AppState } from '../../environment/AppState'
import {
  GithubWorkflowRunEventEntity,
  githubWorkflowRunEventGsiSkPrefix
} from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { GithubPushEntity } from '../entityStore/entities/GithubPushEntity'
import { rangeWhereSkBeginsWith } from '@symphoniacloud/dynamodb-entity-store'
import { workflowRunEventsFromMultipleEventEntityResponse } from './githubWorkflowRunEvent'
import { pushesFromMultipleEntityResponse } from './githubPush'

// GithubActivity is a domain concept that is only read, not written, since it's
// only used when runs and pushes are read from the database at the same time.

export type GithubActivity = GithubWorkflowRunActivity | GithubPushActivity

export interface GithubWorkflowRunActivity {
  activityType: 'completedRun'
  event: GithubWorkflowRunEvent
}

export interface GithubPushActivity {
  activityType: 'push'
  event: GithubPush
}

export function activityIsWorkflowRunActivity(
  activity: GithubActivity
): activity is GithubWorkflowRunActivity {
  return activity.activityType === 'completedRun'
}

// WorkflowRuns and Pushes deliberately use the same GSI key format so that they can be queried
// in one call. dynamdb-entity-store supports converting records for different entities during
// a query by using the `forMultiple` function
export async function getRecentActivityForRepo(appState: AppState, accountId: number, repoId: number) {
  const activityResponse = await appState.entityStore
    .forMultiple([GithubWorkflowRunEventEntity, GithubPushEntity])
    .queryOnePageWithGsiByPkAndSk(
      GithubWorkflowRunEventEntity,
      { ownerId: accountId },
      rangeWhereSkBeginsWith(githubWorkflowRunEventGsiSkPrefix({ repoId })),
      {
        scanIndexForward: false
      }
    )

  return mergeOrderedLists(
    workflowRunEventsToActivities(workflowRunEventsFromMultipleEventEntityResponse(activityResponse)),
    pushesToActivities(pushesFromMultipleEntityResponse(activityResponse)),
    (x, y) => activityDateTime(x) > activityDateTime(y)
  )
}

export function workflowRunEventsToActivities(events: GithubWorkflowRunEvent[]): GithubActivity[] {
  return events.map((event) => {
    return {
      activityType: 'completedRun',
      event: event
    }
  })
}

export function pushesToActivities(events: GithubPush[]): GithubActivity[] {
  return events.map((event) => {
    return {
      activityType: 'push',
      event: event
    }
  })
}

export function activityDateTime(activity: GithubActivity) {
  return activityIsWorkflowRunActivity(activity) ? activity.event.updatedAt : activity.event.dateTime
}
