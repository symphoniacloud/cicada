import { AppState } from '../../environment/AppState.js'
import { publishToSubscriptionsForUsers } from './webPushPublisher.js'
import {
  friendlyStatus,
  getRelatedMemberIdsForRunEvent,
  runBasicStatus
} from '../github/githubWorkflowRunEvent.js'
import { CicadaWebNotification } from '../../outboundInterfaces/webPushWrapper.js'
import { filterRepoNotifyEnabled, filterWorkflowNotifyEnabled } from '../user/userNotifyable.js'

import { loadUserScopeReferenceData } from '../github/userScopeReferenceData.js'
import { getRelatedMemberIdsForPush } from '../github/githubPush.js'
import { GitHubWorkflowRunEvent } from '../../ioTypes/GitHubTypes.js'
import {
  CicadaGitHubPushEventBridgeDetail,
  CicadaGitHubWorkflowRunEventEventBridgeDetail
} from '../../ioTypes/EventBridgeTypes.js'

// TOEventually - these are going to create a lot of queries for subscription lookup for large organizations
// May be better to have one table / index for this.

export async function handleNewWorkflowRunEvent(
  appState: AppState,
  eventDetail: CicadaGitHubWorkflowRunEventEventBridgeDetail
) {
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
  workflowRunEvent: GitHubWorkflowRunEvent
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

export async function handleNewPush(appState: AppState, eventDetail: CicadaGitHubPushEventBridgeDetail) {
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
