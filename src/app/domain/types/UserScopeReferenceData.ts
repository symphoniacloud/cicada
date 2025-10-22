import { GithubAccountSummary, GithubRepoSummary } from './GithubSummaries.js'
import { GithubRepoId } from './GithubRepoId.js'
import { GithubWorkflowId } from './GithubWorkflowId.js'
import { GithubUserId } from './GithubUserId.js'
import { GithubAccountId } from './GithubAccountId.js'
import { GithubWorkflow } from './GithubWorkflow.js'

export interface GithubAccountStructure extends GithubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GithubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GithubRepoSummary {
  workflows: Record<GithubWorkflowId, GithubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GithubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GithubAccountId, GithubAccountStructure>
}
