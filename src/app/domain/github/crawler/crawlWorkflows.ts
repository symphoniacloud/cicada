import { AppState } from '../../../environment/AppState'
import { GithubRepoSummary } from '../../types/GithubSummaries'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { processRawWorkflows } from '../githubWorkflow'
import { fromRawGithubWorkflowId, GithubWorkflowId } from '../../types/GithubWorkflowId'

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
