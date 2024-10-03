import { AppState } from '../../environment/AppState'
import { latestWorkflowRunEventsPerWorkflowForAccounts } from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { getUserSettings } from './persistedUserSettings'
import { calculateUserSettings } from './calculatedUserSettings'
import { CalculatedUserSettings } from '../types/UserSettings'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubUserId } from '../types/GithubUserId'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { recentActiveBranchesForAccounts } from '../github/githubLatestPushesPerRef'
import { GithubPush } from '../types/GithubPush'
import { getRunEventsForWorkflow } from '../github/githubWorkflowRunEvent'
import { getRecentActivityForRepo, GithubActivity } from '../github/githubActivity'
import {
  allAccountIDsFromStructure,
  loadInstallationAccountStructureForUser
} from '../github/githubAccountStructure'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'

interface UserVisibleObjects<T> {
  allEvents: T[]
  visibleEvents: T[]
  someEventsHidden: boolean
}

export type VisibleWorkflowRunEvents = UserVisibleObjects<GithubWorkflowRunEvent>
export type VisiblePushes = UserVisibleObjects<GithubPush>
export type VisibleActivity = UserVisibleObjects<GithubActivity>

// TODO - perform authorization for user visibility in this file

export async function getLatestWorkflowRunEventsForUserWithUserSettings(
  appState: AppState,
  userId: GithubUserId
): Promise<VisibleWorkflowRunEvents> {
  const installationStructure = await loadInstallationAccountStructureForUser(appState, userId)
  const allEvents = await latestWorkflowRunEventsPerWorkflowForAccounts(
    appState,
    allAccountIDsFromStructure(installationStructure)
  )
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), installationStructure)
  return toVisibleEvents(allEvents, userSettings)
}

export async function getLatestWorkflowRunEventsForAccountForUser(
  appState: AppState,
  accountId: GithubAccountId
): Promise<VisibleWorkflowRunEvents> {
  return toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId))
}

export async function getLatestWorkflowRunEventsForRepoForUser(
  appState: AppState,
  repo: GithubRepoKey
): Promise<VisibleWorkflowRunEvents> {
  return toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForRepo(appState.entityStore, repo))
}

export async function getRunEventsForWorkflowForUser(
  appState: AppState,
  workflow: GithubWorkflowKey
): Promise<VisibleWorkflowRunEvents> {
  return toVisibleEvents(await getRunEventsForWorkflow(appState, workflow))
}

export async function getRecentActivityForRepoForUser(
  appState: AppState,
  repo: GithubRepoKey
): Promise<VisibleActivity> {
  const allEvents = await getRecentActivityForRepo(appState, repo)
  return {
    allEvents,
    visibleEvents: allEvents,
    someEventsHidden: false
  }
}

export async function getRecentActiveBranchesForUserWithUserSettings(
  appState: AppState,
  userId: GithubUserId
) {
  const installationStructure = await loadInstallationAccountStructureForUser(appState, userId)
  const allActivity = await recentActiveBranchesForAccounts(
    appState,
    allAccountIDsFromStructure(installationStructure)
  )
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), installationStructure)
  return toVisiblePushes(allActivity, userSettings)
}

export async function getRecentActiveBranchesForUserAndAccount(
  appState: AppState,
  accountId: GithubAccountId
) {
  return toVisiblePushes(await recentActiveBranchesForAccounts(appState, [accountId]))
}

function toVisibleEvents(allEvents: GithubWorkflowRunEvent[], userSettings?: CalculatedUserSettings) {
  const visibleEvents = userSettings
    ? allEvents.filter(
        ({ accountId, repoId, workflowId }) =>
          userSettings.github.accounts[accountId]?.repos[repoId]?.workflows[workflowId]?.visible ?? false
      )
    : allEvents
  return {
    allEvents,
    visibleEvents,
    someEventsHidden: allEvents.length !== visibleEvents.length
  }
}

function toVisiblePushes(allEvents: GithubPush[], userSettings?: CalculatedUserSettings) {
  const visibleEvents = userSettings
    ? allEvents.filter(
        ({ accountId, repoId }) => userSettings.github.accounts[accountId]?.repos[repoId]?.visible ?? false
      )
    : allEvents
  return {
    allEvents,
    visibleEvents,
    someEventsHidden: allEvents.length !== visibleEvents.length
  }
}
