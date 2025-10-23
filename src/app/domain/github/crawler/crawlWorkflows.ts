import { AppState } from '../../../environment/AppState.js'
import { GithubRepoSummary } from '../../types/GithubSummaries.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'
import { processRawWorkflows } from '../githubWorkflow.js'
import { fromRawGitHubWorkflowId } from '../../types/toFromRawGitHubIds.js'
import { GitHubWorkflowId } from '../../../types/GitHubIdTypes.js'

export async function crawlOneWorkflow(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepoSummary,
  workflowId: GitHubWorkflowId
) {
  const rawWorkflow = (await lookupWorkflowsForRepo(githubClient, repo)).find(
    (wf) => fromRawGitHubWorkflowId(wf.id) === workflowId
  )
  return rawWorkflow === undefined ? undefined : (await processRawWorkflows(appState, repo, [rawWorkflow]))[0]
}

export async function crawlWorkflows(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepoSummary
) {
  return await processRawWorkflows(appState, repo, await lookupWorkflowsForRepo(githubClient, repo))
}

async function lookupWorkflowsForRepo(githubClient: GithubInstallationClient, repo: GithubRepoSummary) {
  return await githubClient.listWorkflowsForRepo(repo.accountName, repo.repoName)
}
