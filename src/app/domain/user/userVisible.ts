import { AppState } from '../../environment/AppState'
import { getAllAccountIdsForUser } from '../github/githubMembership'
import {
  latestWorkflowRunEventsPerWorkflowForOwners,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { getUserSettings } from './persistedUserSettings'
import { calculateUserSettings } from './calculatedUserSettings'
import { CalculatedUserSettings } from '../types/UserSettings'
import { GithubRepoKey, GithubUserId } from '../types/GithubKeys'

export interface VisibleWorkflowRunEvents {
  allEvents: GithubWorkflowRunEvent[]
  visibleEvents: GithubWorkflowRunEvent[]
  someEventsHidden: boolean
}

export async function getLatestVisibleWorkflowRunEventsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<VisibleWorkflowRunEvents> {
  const allEvents = await getAllLatestRunEventsForUser(appState, userId)
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), allEvents)
  return toVisibleEvents(allEvents, userSettings)
}

export async function getLatestVisibleWorkflowRunEventsPerWorkflowForRepoForUser(
  appState: AppState,
  userId: GithubUserId,
  repo: GithubRepoKey
): Promise<VisibleWorkflowRunEvents> {
  const allEvents = await latestWorkflowRunEventsPerWorkflowForRepo(appState, repo)
  const userSettings = calculateUserSettings(
    await getUserSettings(appState, userId),
    await getWorkflowsForUser(appState, userId)
  )
  return toVisibleEvents(allEvents, userSettings)
}

function toVisibleEvents(allEvents: GithubWorkflowRunEvent[], userSettings: CalculatedUserSettings) {
  const visibleEvents = allEvents.filter(
    ({ ownerId, repoId, workflowId }) =>
      userSettings.github.accounts.get(ownerId)?.repos.get(repoId)?.workflows.get(workflowId)?.visible ??
      false
  )
  return {
    allEvents,
    visibleEvents,
    someEventsHidden: allEvents.length !== visibleEvents.length
  }
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
