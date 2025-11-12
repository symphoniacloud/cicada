import { AppState } from '../../environment/AppState.js'
import {
  getInstallationOrUndefined,
  putInstallation
} from '../entityStore/entities/GithubInstallationEntity.js'
import { logger } from '../../util/logging.js'
import deepEqual from 'deep-equal'
import { GitHubInstallation } from '../../ioTypes/GitHubTypes.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING } from '../../../multipleContexts/eventBridgeSchemas.js'

export async function processInstallationAndTriggerInstallationCrawl(
  appState: AppState,
  installation: GitHubInstallation
) {
  if (`${installation.appId}` !== (await appState.config.github()).appId) {
    logger.warn(`Not processing invalid installation - unexpected app ID`)
    return
  }

  const previousInstallation = await getInstallationOrUndefined(appState.entityStore, installation.accountId)
  const isNewInstallation = previousInstallation === undefined
  const installationChanged = !isNewInstallation && !deepEqual(previousInstallation, installation)

  if (isNewInstallation) {
    logger.info(`New installation for ${installation.accountName} / ${installation.accountId}`)
  }
  if (installationChanged) {
    logger.info(
      `Installation details have changed for ${installation.accountName} / ${installation.accountId}`
    )
  }

  const modifiedInstallation = isNewInstallation || installationChanged

  if (modifiedInstallation) {
    await putInstallation(appState.entityStore, installation)
  }

  // This function can get called either (a) when an installation changes or (b) just on a scheduled update.
  // If it's a scheduled update and nothing about the installation has changed we want to do less work,
  //   so reduce lookbackDays to 2
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING, {
    installation,
    lookbackDays: modifiedInstallation ? 30 : 2
  })
}
