import { AppState } from '../../../environment/AppState'
import { GithubRepoSummary } from '../../types/GithubSummaries'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { processRawWorkflows } from '../githubWorkflow'
import { fromRawGithubWorkflowId, GithubWorkflowId } from '../../types/GithubWorkflowId'
import { logger } from '../../../util/logging'
import { RawGithubWorkflowRunEvent } from '../../types/rawGithub/RawGithubWorkflowRunEvent'
import { processRawRunEventsForWorkflow } from '../githubWorkflowRunEvent'

export async function crawlWorkflows(
  appState: AppState,
  repo: GithubRepoSummary,
  githubClient: GithubInstallationClient,
  rawRunEventsForRepo: RawGithubWorkflowRunEvent[]
) {
  const rawWorkflows = await githubClient.listWorkflowsForRepo(repo.accountName, repo.repoName)
  const workflows = await processRawWorkflows(appState, repo, rawWorkflows)
  if (workflows.length > 0)
    logger.info(`Processing ${workflows.length} workflows in repo ${repo.accountName}/${repo.repoName}`)

  for (const workflow of workflows) {
    await processRawRunEventsForWorkflow(
      appState,
      workflow,
      rawRunEventsForRepo.filter(
        (event) => fromRawGithubWorkflowId(event.workflow_id) === workflow.workflowId
      ),
      false
    )
  }
}

export async function crawlOneWorkflow(
  appState: AppState,
  repoSummary: GithubRepoSummary,
  workflowId: GithubWorkflowId,
  githubClient: GithubInstallationClient
) {
  const rawWorkflows = await githubClient.listWorkflowsForRepo(repoSummary.accountName, repoSummary.repoName)
  const rawWorkflow = rawWorkflows.find((wf) => fromRawGithubWorkflowId(wf.id) === workflowId)
  return rawWorkflow === undefined
    ? undefined
    : (await processRawWorkflows(appState, repoSummary, [rawWorkflow]))[0]
}
