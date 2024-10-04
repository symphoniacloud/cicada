import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { putPushIfNoKeyExists } from '../entityStore/entities/GithubPushEntity'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { GithubPush } from '../types/GithubPush'
import {
  domainObjectsFromMultipleEventEntityResponse,
  executeAndCatchConditionalCheckFailed
} from '../entityStore/entityStoreOperationSupport'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { MultipleEntityCollectionResponse } from '@symphoniacloud/dynamodb-entity-store'
import { saveLatestPushes } from './githubLatestPushesPerRef'
import { GITHUB_PUSH } from '../entityStore/entityTypes'

export async function processPushes(appState: AppState, pushes: GithubPush[], publishNotifications: boolean) {
  const newPushes = await savePushes(appState, pushes)
  await saveLatestPushes(appState, newPushes)
  for (const newEvent of publishNotifications ? newPushes : []) {
    await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_PUSH, newEvent)
  }
}

async function savePushes(appState: AppState, pushes: GithubPush[]) {
  const newPushes = (
    await Promise.all(
      pushes.map(async (push) => {
        return executeAndCatchConditionalCheckFailed(async () => {
          return putPushIfNoKeyExists(appState.entityStore, push)
        })
      })
    )
  ).filter((x): x is GithubPush => x !== undefined)
  logger.debug(`Found ${newPushes.length} new pushes`)

  return newPushes
}

export function pushesFromMultipleEntityResponse(
  allActivity: MultipleEntityCollectionResponse
): GithubPush[] {
  return domainObjectsFromMultipleEventEntityResponse(allActivity, GITHUB_PUSH)
}

export function latestCommitInPush(push: Pick<GithubPush, 'commits'>) {
  return push.commits[push.commits.length - 1]
}
