import { GithubAccountSummary, GithubRepoSummary } from './GithubSummaries'
import { GithubRepoId } from './GithubRepoId'
import { GithubWorkflowId } from './GithubWorkflowId'
import { GithubUserId } from './GithubUserId'
import { GithubAccountId } from './GithubAccountId'
import { GithubWorkflow } from './GithubWorkflow'

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
