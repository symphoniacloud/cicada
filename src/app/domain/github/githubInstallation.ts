import { AppState } from '../../environment/AppState'
import { fromRawGithubInstallation, GithubInstallation } from '../types/GithubInstallation'
import { getInstallationOrUndefined, putInstallation } from '../entityStore/entities/GithubInstallationEntity'
import { logger } from '../../util/logging'
import deepEqual from 'deep-equal'
import { RawGithubInstallation } from '../types/rawGithub/RawGithubInstallation'

export async function processRawInstallation(appState: AppState, rawInstallation: RawGithubInstallation) {
  return await processInstallation(appState, fromRawGithubInstallation(rawInstallation))
}

export async function processInstallation(appState: AppState, installation: GithubInstallation) {
  if (`${installation.appId}` !== (await appState.config.github()).appId) {
    logger.warn(`Not processing invalid installation - unexpected app ID`)
    return null
  }

  return await saveInstallation(appState, installation)
}

async function saveInstallation(appState: AppState, installation: GithubInstallation) {
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

  if (isNewInstallation || installationChanged) {
    await putInstallation(appState.entityStore, installation)
  }

  return installation
}
