import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { putPushIfNoKeyExists } from '../entityStore/entities/GithubPushEntity.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { GithubPush } from '../types/GithubPush.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { saveLatestPushes } from './githubLatestPushesPerRef.js'
import { GithubUserId } from '../types/GithubUserId.js'
import { getUserIdsForAccount } from './githubMembership.js'

export async function processPushes(appState: AppState, pushes: GithubPush[], publishNotifications: boolean) {
  if (pushes.length > 0) {
    logger.debug(`Processing ${pushes.length} pushes for ${pushes[0].accountName}/${pushes[0].repoName}`)
  }
  const newPushes = await savePushes(appState, pushes)
  if (newPushes.length > 0) {
    logger.info(
      `Found ${newPushes.length} new pushes for ${newPushes[0].accountName}/${newPushes[0].repoName}`
    )
  }
  await saveLatestPushes(appState, newPushes)
  for (const newEvent of publishNotifications ? newPushes : []) {
    await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_PUSH, newEvent)
  }
}

async function savePushes(appState: AppState, pushes: GithubPush[]) {
  return (
    await Promise.all(
      pushes.map(async (push) => {
        return executeAndCatchConditionalCheckFailed(async () => {
          return putPushIfNoKeyExists(appState.entityStore, push)
        })
      })
    )
  ).filter((x): x is GithubPush => x !== undefined)
}

export function latestCommitInPush(push: Pick<GithubPush, 'commits'>) {
  return push.commits[push.commits.length - 1]
}

export async function getRelatedMemberIdsForPush(
  appState: AppState,
  push: GithubPush
): Promise<GithubUserId[]> {
  return getUserIdsForAccount(appState, push.accountId)
}
