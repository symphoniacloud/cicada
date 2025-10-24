import { GithubWorkflow } from './GithubWorkflow.js'
import {
  GitHubAccountId,
  GitHubAccountSummary,
  GitHubRepoId,
  GitHubRepoSummary,
  GitHubUserId,
  GitHubWorkflowId
} from '../../types/GitHubTypes.js'

export interface GithubAccountStructure extends GitHubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GitHubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GitHubRepoSummary {
  workflows: Record<GitHubWorkflowId, GithubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GitHubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GitHubAccountId, GithubAccountStructure>
}
