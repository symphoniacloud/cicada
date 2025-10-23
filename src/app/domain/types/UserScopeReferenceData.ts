import { GithubAccountSummary, GithubRepoSummary } from './GithubSummaries.js'
import { GithubUserId } from './GithubUserId.js'
import { GithubWorkflow } from './GithubWorkflow.js'
import { GitHubAccountId, GitHubRepoId, GitHubWorkflowId } from '../../types/GitHubIdTypes.js'

export interface GithubAccountStructure extends GithubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GitHubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GithubRepoSummary {
  workflows: Record<GitHubWorkflowId, GithubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GithubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GitHubAccountId, GithubAccountStructure>
}
