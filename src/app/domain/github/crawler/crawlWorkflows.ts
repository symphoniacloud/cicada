import { AppState } from '../../../environment/AppState.js'
import { GithubRepoSummary } from '../../types/GithubSummaries.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'
import { processRawWorkflows } from '../githubWorkflow.js'
import { fromRawGithubWorkflowId, GithubWorkflowId } from '../../types/GithubWorkflowId.js'

export async function crawlOneWorkflow(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepoSummary,
  workflowId: GithubWorkflowId
) {
  const rawWorkflow = (await lookupWorkflowsForRepo(githubClient, repo)).find(
    (wf) => fromRawGithubWorkflowId(wf.id) === workflowId
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
