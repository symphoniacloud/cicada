import {
  GithubAccountSummary,
  GithubRepoSummary,
  GithubWorkflowSummary
} from '../../../src/app/domain/types/GithubSummaries'
import { fromRawGithubWorkflowId } from '../../../src/app/domain/types/GithubWorkflowId'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../../../src/app/domain/types/UserScopeReferenceData'
import { fromRawGithubRepoId } from '../../../src/app/domain/types/GithubRepoId'
import { fromRawGithubAccountId } from '../../../src/app/domain/types/GithubAccountId'
import { GithubAccountType, ORGANIZATION_ACCOUNT_TYPE } from '../../../src/app/domain/types/GithubAccountType'
import { fromRawGithubUserId } from '../../../src/app/domain/types/GithubUserId'

export interface BuildAccountSummaryOptions {
  simpleAccountId?: number
  accountName?: string
  accountType?: GithubAccountType
}

export function buildAccountSummary(options?: BuildAccountSummaryOptions): GithubAccountSummary {
  return {
    accountId: fromRawGithubAccountId(options?.simpleAccountId ?? '123'),
    accountName: options?.accountName ?? '',
    accountType: options?.accountType ?? ORGANIZATION_ACCOUNT_TYPE
  }
}

export interface BuildRepoSummaryOptions extends BuildAccountSummaryOptions {
  simpleRepoId?: number
  repoName?: string
}

export function buildRepoSummmary(options?: BuildRepoSummaryOptions): GithubRepoSummary {
  return {
    ...buildAccountSummary(options),
    repoId: fromRawGithubRepoId(options?.simpleRepoId ?? '456'),
    repoName: options?.repoName ?? ''
  }
}

export interface BuildWorkflowSummaryOptions extends BuildRepoSummaryOptions {
  simpleWorkflowId?: number
  workflowName?: string
  path?: string
}

export function buildWorkflowSummary(options?: BuildWorkflowSummaryOptions): GithubWorkflowSummary {
  return {
    ...buildRepoSummmary(options),
    workflowId: fromRawGithubWorkflowId(options?.simpleWorkflowId ?? '789'),
    path: options?.path ?? '',
    workflowName: options?.workflowName
  }
}

export interface BuildAccountStructureOptions extends BuildAccountSummaryOptions {
  repos?: GithubRepoStructure[]
}

export function buildAccountStructure(options?: BuildAccountStructureOptions): GithubAccountStructure {
  return {
    ...buildRepoSummmary(options),
    repos: Object.fromEntries((options?.repos ?? []).map((repo) => [repo.repoId, repo]))
  }
}

export interface BuildRepoStructureOptions extends BuildRepoSummaryOptions {
  workflows?: GithubWorkflowSummary[]
}

export function buildRepoStructure(options?: BuildRepoStructureOptions): GithubRepoStructure {
  return {
    ...buildRepoSummmary(options),
    workflows: Object.fromEntries(
      (options?.workflows ?? [buildWorkflowSummary()]).map((wf) => [wf.workflowId, wf])
    )
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
