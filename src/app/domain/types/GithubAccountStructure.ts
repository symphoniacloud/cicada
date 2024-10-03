import { GithubAccountSummary, GithubRepoSummary, GithubWorkflowSummary } from './GithubSummaries'
import { GithubRepoId } from './GithubRepoId'
import { GithubWorkflowId } from './GithubWorkflowId'
import { GithubAccountId } from './GithubAccountId'

export interface GithubAccountStructure extends GithubAccountSummary {
  repos: Record<GithubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GithubRepoSummary {
  workflows: Record<GithubWorkflowId, GithubWorkflowSummary>
}

export interface GithubInstallationAccountStructure extends GithubAccountStructure {
  publicAccounts: Record<GithubAccountId, GithubAccountStructure>
}
