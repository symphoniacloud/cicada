import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { putPushIfNoKeyExists } from '../entityStore/entities/GithubPushEntity.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { saveLatestPushes } from './githubLatestPushesPerRef.js'
import { getUserIdsForAccount } from './githubMembership.js'

import { GitHubPush, GitHubUserId } from '../../ioTypes/GitHubTypes.js'
import { EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH } from '../../../multipleContexts/eventBridgeSchemas.js'

export async function processPushes(appState: AppState, pushes: GitHubPush[], publishNotifications: boolean) {
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
    await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH, newEvent)
  }
}

async function savePushes(appState: AppState, pushes: GitHubPush[]) {
  return (
    await Promise.all(
      pushes.map(async (push) => {
        return executeAndCatchConditionalCheckFailed(async () => {
          return putPushIfNoKeyExists(appState.entityStore, push)
        })
      })
    )
  ).filter((x): x is GitHubPush => x !== undefined)
}

export function latestCommitInPush(push: Pick<GitHubPush, 'commits'>) {
  return push.commits[push.commits.length - 1]
}

export async function getRelatedMemberIdsForPush(
  appState: AppState,
  push: GitHubPush
): Promise<GitHubUserId[]> {
  return getUserIdsForAccount(appState, push.accountId)
}
