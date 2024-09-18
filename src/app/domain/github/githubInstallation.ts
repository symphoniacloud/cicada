import { AppState } from '../../environment/AppState'
import { fromRawGithubInstallation, GithubInstallation } from '../types/GithubInstallation'
import { GithubInstallationEntity } from '../entityStore/entities/GithubInstallationEntity'
import { logger } from '../../util/logging'
import deepEqual from 'deep-equal'
import { RawGithubInstallation } from '../types/rawGithub/RawGithubInstallation'
import { GithubAccountId } from '../types/GithubKeys'

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
  const installationsStore = appState.entityStore.for(GithubInstallationEntity)
  const previousInstallationForAccount = await installationsStore.getOrUndefined({
    accountId: installation.accountId
  })
  const newAccount = previousInstallationForAccount === undefined
  const installationChanged =
    previousInstallationForAccount !== undefined &&
    !installationsEqual(previousInstallationForAccount, installation)

  if (newAccount) {
    logger.info(`New account installation for ${installation.accountLogin} / ${installation.accountId}`)
  }
  if (installationChanged) {
    logger.info(
      `Installation details have changed for ${installation.accountLogin} / ${installation.accountId}`
    )
  }

  const installationStateChanged = newAccount || installationChanged

  if (installationStateChanged) {
    await installationsStore.put(installation)
  }

  return installation
}

export function installationsEqual(x: GithubInstallation, y: GithubInstallation) {
  return deepEqual(x, y)
}

export async function getInstallationForAccount(appState: AppState, accountId: GithubAccountId) {
  return appState.entityStore.for(GithubInstallationEntity).getOrThrow({ accountId })
}
