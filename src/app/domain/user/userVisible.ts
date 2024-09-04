import { AppState } from '../../environment/AppState'
import { getAllAccountIdsForUser } from '../github/githubMembership'
import { latestWorkflowRunEventsPerWorkflowForOwners } from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { getUserSettings } from './persistedUserSettings'
import { calculateUserSettings } from './calculatedUserSettings'
import { CalculatedUserSettings } from '../types/UserSettings'

export async function getLatestVisibleWorkflowRunEventsForUser(
  appState: AppState,
  userId: number
): Promise<{
  allEvents: GithubWorkflowRunEvent[]
  visibleEvents: GithubWorkflowRunEvent[]
  someWorkflowsInvisible: boolean
}> {
  const allEvents = await getAllLatestRunEventsForUser(appState, userId)
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), allEvents)
  const filteredEvents = filterOutConfiguredInvisibleWorkflowEvents(allEvents, userSettings)
  return {
    allEvents,
    visibleEvents: filteredEvents,
    someWorkflowsInvisible: allEvents.length !== filteredEvents.length
  }
}

export async function getWorkflowsForUser(appState: AppState, userId: number): Promise<GithubWorkflow[]> {
  // Workflow run events extend workflow, so we can just return the latest run events
  return getAllLatestRunEventsForUser(appState, userId)
}

export function filterOutConfiguredInvisibleWorkflowEvents(
  allEvents: GithubWorkflowRunEvent[],
  userSettings: CalculatedUserSettings
) {
  return allEvents.filter(
    ({ ownerId, repoId, workflowId }) =>
      userSettings.github.accounts.get(ownerId)?.repos.get(repoId)?.workflows.get(workflowId)?.visible ??
      false
  )
}

async function getAllLatestRunEventsForUser(
  appState: AppState,
  userId: number
): Promise<GithubWorkflowRunEvent[]> {
  return await latestWorkflowRunEventsPerWorkflowForOwners(
    appState,
    await getAllAccountIdsForUser(appState, userId)
  )
}
