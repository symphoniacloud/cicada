import { AppState } from '../../environment/AppState'
import { getAllAccountIdsForUser } from '../github/githubAccount'
import {
  latestWorkflowRunEventsPerWorkflowForOwner,
  latestWorkflowRunEventsPerWorkflowForOwners,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { getUserSettings } from './persistedUserSettings'
import { calculateUserSettings } from './calculatedUserSettings'
import { CalculatedUserSettings } from '../types/UserSettings'
import { GithubAccountId, GithubRepoKey, GithubUserId, GithubWorkflowKey } from '../types/GithubKeys'
import { recentActiveBranchesForOwners } from '../github/githubLatestPushesPerRef'
import { GithubPush } from '../types/GithubPush'
import { getRunEventsForWorkflow } from '../github/githubWorkflowRunEvent'
import { getRecentActivityForRepo, GithubActivity } from '../github/githubActivity'
import { getRepositoriesForAccount, repositorySummaryToKey } from '../github/githubRepository'
import { GithubRepository } from '../types/GithubRepository'

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
  const allEvents = await getAllLatestRunEventsForUser(appState, userId)
  const allRepoKeys = await getRepoKeysForUser(appState, userId)
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), allRepoKeys, allEvents)
  return toVisibleEvents(allEvents, userSettings)
}

export async function getLatestWorkflowRunEventsForAccountForUser(
  appState: AppState,
  accountId: GithubAccountId
): Promise<VisibleWorkflowRunEvents> {
  return toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForOwner(appState, accountId))
}

export async function getLatestWorkflowRunEventsForRepoForUser(
  appState: AppState,
  repo: GithubRepoKey
): Promise<VisibleWorkflowRunEvents> {
  return toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForRepo(appState, repo))
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
  const allActivity = await recentActiveBranchesForOwners(
    appState,
    await getAllAccountIdsForUser(appState, userId)
  )
  const userSettings = calculateUserSettings(
    await getUserSettings(appState, userId),
    await getRepoKeysForUser(appState, userId),
    await getWorkflowsForUser(appState, userId)
  )
  return toVisiblePushes(allActivity, userSettings)
}

export async function getRecentActiveBranchesForUserAndAccount(
  appState: AppState,
  accountId: GithubAccountId
) {
  return toVisiblePushes(await recentActiveBranchesForOwners(appState, [accountId]))
}

function toVisibleEvents(allEvents: GithubWorkflowRunEvent[], userSettings?: CalculatedUserSettings) {
  const visibleEvents = userSettings
    ? allEvents.filter(
        ({ ownerId, repoId, workflowId }) =>
          userSettings.github.accounts[ownerId]?.repos[repoId]?.workflows[workflowId]?.visible ?? false
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
        ({ ownerId, repoId }) => userSettings.github.accounts[ownerId]?.repos[repoId]?.visible ?? false
      )
    : allEvents
  return {
    allEvents,
    visibleEvents,
    someEventsHidden: allEvents.length !== visibleEvents.length
  }
}

export async function getReposForUser(appState: AppState, userId: GithubUserId): Promise<GithubRepository[]> {
  const allAccountIds = await getAllAccountIdsForUser(appState, userId)
  return (
    await Promise.all(
      allAccountIds.map(async (accountId) => {
        return getRepositoriesForAccount(appState, accountId)
      })
    )
  ).flat()
}

export async function getRepoKeysForUser(appState: AppState, userId: GithubUserId) {
  return (await getReposForUser(appState, userId)).map(repositorySummaryToKey)
}

export async function getWorkflowsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubWorkflow[]> {
  // Workflow run events extend workflow, so we can just return the latest run events for now
  // TODOEventually have a more efficient way of doing this
  return getAllLatestRunEventsForUser(appState, userId)
}

async function getAllLatestRunEventsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubWorkflowRunEvent[]> {
  return await latestWorkflowRunEventsPerWorkflowForOwners(
    appState,
    await getAllAccountIdsForUser(appState, userId)
  )
}
