import {
  fromRawGitHubAccountId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId
} from '../../../src/app/domain/types/toFromRawGitHubIds.js'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../src/app/ioTypes/GitHubSchemas.js'
import {
  GitHubAccountSummary,
  GitHubAccountType,
  GitHubRepoSummary,
  GitHubWorkflow
} from '../../../src/app/ioTypes/GitHubTypes.js'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../../../src/app/domain/types/internalTypes.js'

export interface BuildAccountSummaryOptions {
  simpleAccountId?: number
  accountName?: string
  accountType?: GitHubAccountType
}

export function buildAccountSummary(options?: BuildAccountSummaryOptions): GitHubAccountSummary {
  return {
    accountId: fromRawGitHubAccountId(options?.simpleAccountId ?? 123),
    accountName: options?.accountName ?? '',
    accountType: options?.accountType ?? ORGANIZATION_ACCOUNT_TYPE
  }
}

export interface BuildRepoSummaryOptions extends BuildAccountSummaryOptions {
  simpleRepoId?: number
  repoName?: string
}

export function buildRepoSummmary(options?: BuildRepoSummaryOptions): GitHubRepoSummary {
  return {
    ...buildAccountSummary(options),
    repoId: fromRawGitHubRepoId(options?.simpleRepoId ?? '456'),
    repoName: options?.repoName ?? ''
  }
}

export interface BuildWorkflowOptions extends BuildRepoSummaryOptions {
  simpleWorkflowId?: number
  workflowName?: string
  path?: string
  state?: string
  url?: string
  htmlUrl?: string
  badgeUrl?: string
  createdAt?: string
  updatedAt?: string
}

export function buildWorkflow(options?: BuildWorkflowOptions): GitHubWorkflow {
  return {
    ...buildRepoSummmary(options),
    workflowId: fromRawGitHubWorkflowId(options?.simpleWorkflowId ?? '789'),
    workflowName: options?.workflowName ?? '',
    workflowPath: options?.path ?? '',
    workflowState: options?.state ?? '',
    workflowUrl: options?.url ?? '',
    workflowHtmlUrl: options?.htmlUrl ?? '',
    workflowBadgeUrl: options?.badgeUrl ?? '',
    workflowCreatedAt: options?.createdAt ?? '',
    workflowUpdatedAt: options?.updatedAt ?? ''
  }
}

export interface BuildAccountStructureOptions extends BuildAccountSummaryOptions {
  isMemberAccount?: boolean
  repos?: GithubRepoStructure[]
}

export function buildAccountStructure(options?: BuildAccountStructureOptions): GithubAccountStructure {
  return {
    ...buildRepoSummmary(options),
    isMemberAccount: options?.isMemberAccount === undefined ? true : options.isMemberAccount,
    repos: Object.fromEntries((options?.repos ?? []).map((repo) => [repo.repoId, repo]))
  }
}

export interface BuildRepoStructureOptions extends BuildRepoSummaryOptions {
  workflows?: GitHubWorkflow[]
}

export function buildRepoStructure(options?: BuildRepoStructureOptions): GithubRepoStructure {
  return {
    ...buildRepoSummmary(options),
    workflows: Object.fromEntries((options?.workflows ?? [buildWorkflow()]).map((wf) => [wf.workflowId, wf]))
  }
}

export interface BuildUserScopedRefDataOptions extends BuildAccountStructureOptions {
  simpleUserId?: number
  publicAccounts?: GithubAccountStructure[]
}

export function buildUserScopedRefData(options?: BuildUserScopedRefDataOptions): UserScopeReferenceData {
  return {
    userId: fromRawGithubUserId(options?.simpleUserId ?? '111'),
    memberAccount: buildAccountStructure(options),
    publicAccounts: Object.fromEntries((options?.publicAccounts ?? []).map((acc) => [acc.accountId, acc]))
  }
}
