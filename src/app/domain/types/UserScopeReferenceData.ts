import { GithubAccountSummary, GithubRepoSummary } from './GithubSummaries.js'
import { GithubWorkflow } from './GithubWorkflow.js'
import { GitHubAccountId, GitHubRepoId, GitHubUserId, GitHubWorkflowId } from '../../types/GitHubTypes.js'

export interface GithubAccountStructure extends GithubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GitHubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GithubRepoSummary {
  workflows: Record<GitHubWorkflowId, GithubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GitHubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GitHubAccountId, GithubAccountStructure>
}
