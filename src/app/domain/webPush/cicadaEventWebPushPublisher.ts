import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { publishToSubscriptionsForUsers } from './webPushPublisher'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import {
  friendlyStatus,
  getRelatedMemberIdsForRunEvent,
  runBasicStatus
} from '../github/githubWorkflowRunEvent'
import { isCicadaEventBridgeDetail } from '../../outboundInterfaces/eventBridgeBus'
import { CicadaWebNotification } from '../../outboundInterfaces/webPushWrapper'
import { filterWorkflowNotifyEnabled } from '../user/userNotifyable'

// TOEventually - these are going to create a lot of queries for subscription lookup for large organizations
// May be better to have one table / index for this.

export async function handleNewWorkflowRunEvent(appState: AppState, eventDetail: unknown) {
  if (!isCicadaEventBridgeDetail(eventDetail) || !isGithubWorkflowRunEvent(eventDetail.data)) {
    logger.error(
      `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT} was not of expected format`,
      { eventDetail }
    )
    return
  }

  const workflowRunEvent = eventDetail.data
  const userIds = await getRelatedMemberIdsForRunEvent(appState, workflowRunEvent)
  const notifyEnabledUserIds = await filterWorkflowNotifyEnabled(appState, userIds, workflowRunEvent)

  await publishToSubscriptionsForUsers(
    appState,
    notifyEnabledUserIds,
    generateRunEventNotification(workflowRunEvent)
  )
}

export function generateRunEventNotification(
  workflowRunEvent: GithubWorkflowRunEvent
): CicadaWebNotification {
  const titleIcon = runBasicStatus(workflowRunEvent)
  const bodyStatus = friendlyStatus(workflowRunEvent)

  return {
    title: `${titleIcon} ${workflowRunEvent.workflowName}`,
    body: `Workflow ${workflowRunEvent.workflowName} in Repo ${workflowRunEvent.repoName} ${bodyStatus}`,
    data: { url: workflowRunEvent.htmlUrl }
  }
}

// TOEventually - add this back now that notification preferences added, maybe
// export async function handleNewPush(appState: AppState, eventDetail: unknown) {
//   if (!isCicadaEventBridgeDetail(eventDetail) || !isGithubPush(eventDetail.data)) {
//     logger.error(
//       `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_PUSH} was not of expected format`,
//       { commit: eventDetail }
//     )
//     return
//   }
//
//   const push = eventDetail.data
//
//   await publishToSubscriptionsForUsers(appState, await getRelatedMemberIdsForPush(appState, push), {
//     title: 'New Push',
//     body: `New push to ${push.repoName}:${push.ref} by ${push.actor.login}`
//   })
// }
