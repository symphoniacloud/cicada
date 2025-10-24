import {
  GitHubAccountId,
  GitHubAccountSummary,
  GitHubRepoId,
  GitHubRepoSummary,
  GitHubUserId,
  GitHubWorkflow,
  GitHubWorkflowId,
  GitHubWorkflowRunEvent
} from '../../ioTypes/GitHubTypes.js'

export type FullGitHubWorkflowRunEvent = GitHubWorkflowRunEvent & GitHubWorkflow

export interface GithubAccountStructure extends GitHubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GitHubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GitHubRepoSummary {
  workflows: Record<GitHubWorkflowId, GitHubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GitHubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GitHubAccountId, GithubAccountStructure>
}
