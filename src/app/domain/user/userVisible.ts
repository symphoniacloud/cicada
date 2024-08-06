import { AppState } from '../../environment/AppState'
import { getAllAccountIdsForUser } from '../github/githubMembership'
import { latestWorkflowRunEventsPerWorkflowForOwners } from '../github/githubLatestWorkflowRunEvents'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'

export async function getLatestWorkflowRunEventsForUser(
  appState: AppState,
  userId: number
): Promise<GithubWorkflowRunEvent[]> {
  // Workflow run events extend workflow, so we can just return the latest run events
  return await latestWorkflowRunEventsPerWorkflowForOwners(
    appState,
    await getAllAccountIdsForUser(appState, userId)
  )
}

export async function getWorkflowsForUser(appState: AppState, userId: number): Promise<GithubWorkflow[]> {
  // Workflow run events extend workflow, so we can just return the latest run events
  return getLatestWorkflowRunEventsForUser(appState, userId)
}
