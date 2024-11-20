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
import { filterRepoNotifyEnabled, filterWorkflowNotifyEnabled } from '../user/userNotifyable'

import { loadUserScopeReferenceData } from '../github/userScopeReferenceData'
import { isGithubPush } from '../types/GithubPush'
import { getRelatedMemberIdsForPush } from '../github/githubPush'

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
  if (userIds.length === 0) return
  // TODO - this is a hack to avoid terrible performance - see todo in filterWorkflowNotifyEnabled
  const refData = await loadUserScopeReferenceData(appState, userIds[0])
  const notifyEnabledUserIds = await filterWorkflowNotifyEnabled(appState, refData, userIds, workflowRunEvent)

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
  const workflowName = workflowRunEvent.workflowName

  return {
    title: `${titleIcon} ${workflowName}`,
    body: `Workflow ${workflowName} in Repo ${workflowRunEvent.repoName} ${bodyStatus}`,
    data: { url: workflowRunEvent.runHtmlUrl }
  }
}

export async function handleNewPush(appState: AppState, eventDetail: unknown) {
  if (!isCicadaEventBridgeDetail(eventDetail) || !isGithubPush(eventDetail.data)) {
    logger.error(
      `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_PUSH} was not of expected format`,
      { commit: eventDetail }
    )
    return
  }

  const push = eventDetail.data
  const userIds = await getRelatedMemberIdsForPush(appState, push)
  if (userIds.length === 0) return
  // TODO - this is a hack to avoid terrible performance - see todo in filterWorkflowNotifyEnabled
  const refData = await loadUserScopeReferenceData(appState, userIds[0])
  const notifyEnabledUserIds = await filterRepoNotifyEnabled(appState, refData, userIds, push)

  await publishToSubscriptionsForUsers(appState, notifyEnabledUserIds, {
    title: 'New Push',
    body: `New push to ${push.repoName}:${push.ref} by ${push.actor.userName}`,
    data: { url: push.repoUrl ?? '' }
  })
}
