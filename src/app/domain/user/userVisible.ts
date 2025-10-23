import { AppState } from '../../environment/AppState.js'
import { latestWorkflowRunEventsPerWorkflowForAccounts } from '../github/githubLatestWorkflowRunEvents.js'
import { FullGithubWorkflowRunEvent, GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent.js'
import { loadCalculatedUserSettingsOrUseDefaults } from './calculatedUserSettings.js'
import { CalculatedUserSettings } from '../types/UserSettings.js'
import { GitHubAccountId } from '../../types/GitHubIdTypes.js'
import { recentActiveBranchesForAccounts } from '../github/githubLatestPushesPerRef.js'
import { GithubPush } from '../types/GithubPush.js'
import { getRecentActivityForRepo, GithubActivity } from '../github/githubActivity.js'
import {
  allAccountIDsFromRefData,
  getAccountStructure,
  getRepoStructure,
  getWorkflowFromRefData
} from '../github/userScopeReferenceData.js'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity.js'
import {
  getRunEventsForWorkflow,
  getRunEventsForWorkflowPage
} from '../entityStore/entities/GithubWorkflowRunEventEntity.js'
import { failedWithResult, Result, successWith } from '../../util/structuredResult.js'
import { OnePageResponse } from '@symphoniacloud/dynamodb-entity-store'
import { UserScopeReferenceData } from '../types/UserScopeReferenceData.js'
import { toFullWorkflowRunEvents } from '../github/githubWorkflowRunEvent.js'
import { GitHubRepoKey, GitHubWorkflowKey } from '../../types/GitHubKeyTypes.js'

interface UserVisibleObjects<T> {
  allEvents: T[]
  visibleEvents: T[]
  someEventsHidden: boolean
}

export type VisibleFullWorkflowRunEvents = UserVisibleObjects<FullGithubWorkflowRunEvent>
export type VisiblePushes = UserVisibleObjects<GithubPush>
export type VisibleActivity = UserVisibleObjects<GithubActivity>

const UNAUTHORIZED_FAILURE = 'unauthorized'
const failureNotAuthorized = failedWithResult('Not authorized', UNAUTHORIZED_FAILURE)

export async function getLatestWorkflowRunEventsForUserWithUserSettings(
  appState: AppState,
  refData: UserScopeReferenceData
): Promise<VisibleFullWorkflowRunEvents> {
  const allEvents = await latestWorkflowRunEventsPerWorkflowForAccounts(
    appState,
    allAccountIDsFromRefData(refData)
  )
  const userSettings = await loadCalculatedUserSettingsOrUseDefaults(appState, refData)
  return toVisibleEvents(toFullWorkflowRunEvents(refData, allEvents), userSettings)
}

export async function getLatestWorkflowRunEventsForAccountForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GitHubAccountId
): Promise<Result<VisibleFullWorkflowRunEvents>> {
  if (!getAccountStructure(refData, accountId)) return failureNotAuthorized

  return successWith(
    toVisibleEvents(
      toFullWorkflowRunEvents(
        refData,
        await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
      )
    )
  )
}

export async function getLatestWorkflowRunEventsForRepoForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  repo: GitHubRepoKey
): Promise<Result<VisibleFullWorkflowRunEvents>> {
  if (!getRepoStructure(refData, repo)) return failureNotAuthorized

  return successWith(
    toVisibleEvents(
      toFullWorkflowRunEvents(
        refData,
        await latestWorkflowRunEventsPerWorkflowForRepo(appState.entityStore, repo)
      )
    )
  )
}

// TODO - switch to using paged version everywhere
export async function getAllRunEventsForWorkflowForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GitHubWorkflowKey
): Promise<Result<VisibleFullWorkflowRunEvents>> {
  if (!getWorkflowFromRefData(refData, workflow)) return failureNotAuthorized

  return successWith(
    toVisibleEvents(
      toFullWorkflowRunEvents(refData, await getRunEventsForWorkflow(appState.entityStore, workflow))
    )
  )
}

// Need to think what to do here when we end up wanting paged AND visible results
export async function getAvailableRunEventsForWorkflowForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GitHubWorkflowKey,
  limit?: number
): Promise<Result<OnePageResponse<GithubWorkflowRunEvent>>> {
  if (!getWorkflowFromRefData(refData, workflow)) return failureNotAuthorized

  return successWith(await getRunEventsForWorkflowPage(appState.entityStore, workflow, limit))
}

export async function getRecentActivityForRepoForUser(
  appState: AppState,
  refData: UserScopeReferenceData,
  repo: GitHubRepoKey
): Promise<Result<VisibleActivity>> {
  if (!getRepoStructure(refData, repo)) return failureNotAuthorized
  const allEvents = await getRecentActivityForRepo(appState, refData, repo)
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
  accountId: GitHubAccountId
): Promise<Result<VisiblePushes>> {
  if (!getAccountStructure(refData, accountId)) return failureNotAuthorized
  return successWith(toVisiblePushes(await recentActiveBranchesForAccounts(appState, [accountId])))
}

function toVisibleEvents(allEvents: FullGithubWorkflowRunEvent[], userSettings?: CalculatedUserSettings) {
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
