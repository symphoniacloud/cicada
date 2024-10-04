import { AppState } from '../../environment/AppState'
import { latestWorkflowRunEventsPerWorkflowForAccounts } from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { loadCalculatedUserSettingsOrUseDefaults } from './calculatedUserSettings'
import { CalculatedUserSettings } from '../types/UserSettings'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { recentActiveBranchesForAccounts } from '../github/githubLatestPushesPerRef'
import { GithubPush } from '../types/GithubPush'
import { getRecentActivityForRepo, GithubActivity } from '../github/githubActivity'
import {
  allAccountIDsFromRefData,
  getAccountStructure,
  getRepoStructure,
  getWorkflowStructure
} from '../github/userScopeReferenceData'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'
import {
  getRunEventsForWorkflow,
  getRunEventsForWorkflowPage
} from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { failedWithResult, Result, successWith } from '../../util/structuredResult'
import { OnePageResponse } from '@symphoniacloud/dynamodb-entity-store'
import { UserScopeReferenceData } from '../types/UserScopeReferenceData'

interface UserVisibleObjects<T> {
  allEvents: T[]
  visibleEvents: T[]
  someEventsHidden: boolean
}

export type VisibleWorkflowRunEvents = UserVisibleObjects<GithubWorkflowRunEvent>
export type VisiblePushes = UserVisibleObjects<GithubPush>
export type VisibleActivity = UserVisibleObjects<GithubActivity>

const UNAUTHORIZED_FAILURE = 'unauthorized'
const failureNotAuthorized = failedWithResult('Not authorized', UNAUTHORIZED_FAILURE)

export async function getLatestWorkflowRunEventsForUserWithUserSettings(
  appState: AppState,
  refData: UserScopeReferenceData
): Promise<VisibleWorkflowRunEvents> {
  const allEvents = await latestWorkflowRunEventsPerWorkflowForAccounts(
    appState,
    allAccountIDsFromRefData(refData)
  )
  const userSettings = await loadCalculatedUserSettingsOrUseDefaults(appState, refData)
  return toVisibleEvents(allEvents, userSettings)
}

export async function getLatestWorkflowRunEventsForAccountForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GithubAccountId
): Promise<Result<VisibleWorkflowRunEvents>> {
  if (!getAccountStructure(refData, accountId)) return failureNotAuthorized

  return successWith(
    toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId))
  )
}

export async function getLatestWorkflowRunEventsForRepoForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  repo: GithubRepoKey
): Promise<Result<VisibleWorkflowRunEvents>> {
  if (!getRepoStructure(refData, repo)) return failureNotAuthorized

  return successWith(
    toVisibleEvents(await latestWorkflowRunEventsPerWorkflowForRepo(appState.entityStore, repo))
  )
}

// TODO - switch to using paged version everywhere
export async function getAllRunEventsForWorkflowForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GithubWorkflowKey
): Promise<Result<VisibleWorkflowRunEvents>> {
  if (!getWorkflowStructure(refData, workflow)) return failureNotAuthorized

  return successWith(toVisibleEvents(await getRunEventsForWorkflow(appState.entityStore, workflow)))
}

// Need to think what to do here when we end up wanting paged AND visible results
export async function getAvailableRunEventsForWorkflowForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GithubWorkflowKey,
  limit?: number
): Promise<Result<OnePageResponse<GithubWorkflowRunEvent>>> {
  if (!getWorkflowStructure(refData, workflow)) return failureNotAuthorized

  return successWith(await getRunEventsForWorkflowPage(appState.entityStore, workflow, limit))
}

export async function getRecentActivityForRepoForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  repo: GithubRepoKey
): Promise<Result<VisibleActivity>> {
  if (!getRepoStructure(refData, repo)) return failureNotAuthorized
  const allEvents = await getRecentActivityForRepo(appState, repo)
  return successWith({
    allEvents,
    visibleEvents: allEvents,
    someEventsHidden: false
  })
}

export async function getRecentActiveBranchesForUserWithUserSettings(
  appState: AppState,
  refData: UserScopeReferenceData
) {
  return toVisiblePushes(
    await recentActiveBranchesForAccounts(appState, allAccountIDsFromRefData(refData)),
    await loadCalculatedUserSettingsOrUseDefaults(appState, refData)
  )
}

export async function getRecentActiveBranchesForUserAndAccount(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GithubAccountId
): Promise<Result<VisiblePushes>> {
  if (!getAccountStructure(refData, accountId)) return failureNotAuthorized
  return successWith(toVisiblePushes(await recentActiveBranchesForAccounts(appState, [accountId])))
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
