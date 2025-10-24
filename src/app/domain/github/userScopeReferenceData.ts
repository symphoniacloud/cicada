import { AppState } from '../../environment/AppState.js'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData.js'
import { getUnarchivedRepositoriesForAccount, narrowToRepoSummary, repoKeysEqual } from './githubRepo.js'
import { getActiveWorkflowsForAccount } from './githubWorkflow.js'
import { getPublicAccountsForInstallationAccount } from '../entityStore/entities/GithubPublicAccountEntity.js'
import { narrowToAccountSummary } from './githubAccount.js'
import { GithubWorkflow } from '../types/GithubWorkflow.js'
import { getInstalledAccountIdForUser } from './githubMembership.js'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity.js'
import {
  GitHubAccountId,
  GitHubAccountSummary,
  GitHubRepo,
  GitHubRepoId,
  GitHubRepoKey,
  GitHubUserId,
  GitHubWorkflowKey
} from '../../types/GitHubTypes.js'

export async function loadUserScopeReferenceData(
  appState: AppState,
  userId: GitHubUserId
): Promise<UserScopeReferenceData> {
  const memberAccountId = await getInstalledAccountIdForUser(appState, userId)
  const memberAccount = await getInstallationOrThrow(appState.entityStore, memberAccountId)

  return {
    userId,
    memberAccount: await loadAccountStructure(appState, memberAccount, true),
    publicAccounts: await loadPublicAccountsStructure(appState, memberAccountId)
  }
}

export async function loadAccountStructure<TAccount extends GitHubAccountSummary>(
  appState: AppState,
  account: TAccount,
  isMemberAccount: boolean
): Promise<GithubAccountStructure> {
  return {
    ...narrowToAccountSummary(account),
    isMemberAccount,
    repos: await loadReposStructure(appState, account.accountId)
  }
}

export async function loadPublicAccountsStructure(
  appState: AppState,
  accountId: GitHubAccountId
): Promise<Record<GitHubAccountId, GithubAccountStructure>> {
  const allPublicAccounts = await getPublicAccountsForInstallationAccount(appState.entityStore, accountId)
  const allPublicAccountStructure: Record<GitHubAccountId, GithubAccountStructure> = {}
  for (const publicAccount of allPublicAccounts) {
    allPublicAccountStructure[publicAccount.accountId] = await loadAccountStructure(
      appState,
      publicAccount,
      false
    )
  }
  return allPublicAccountStructure
}

async function loadReposStructure(
  appState: AppState,
  accountId: GitHubAccountId
): Promise<Record<GitHubRepoId, GithubRepoStructure>> {
  const allRepos = await getUnarchivedRepositoriesForAccount(appState, accountId)
  const allWorkflows = await getActiveWorkflowsForAccount(appState, accountId)
  return Object.fromEntries(allRepos.map((repo) => [repo.repoId, buildRepoStructure(repo, allWorkflows)]))
}

function buildRepoStructure(repo: GitHubRepo, allWorkflows: GithubWorkflow[]): GithubRepoStructure {
  return {
    ...narrowToRepoSummary(repo),
    workflows: Object.fromEntries(
      allWorkflows
        .filter((workflow) => repoKeysEqual(repo, workflow))
        .map((workflow) => [workflow.workflowId, workflow])
    )
  }
}

export function getAccountStructure(
  refData: UserScopeReferenceData,
  accountId: GitHubAccountId
): GithubAccountStructure | undefined {
  return refData.memberAccount.accountId === accountId
    ? refData.memberAccount
    : refData.publicAccounts[accountId]
}

export function getRepoStructureFromAccount(
  accountStructure: GithubAccountStructure | undefined,
  repoKey: GitHubRepoKey
): GithubRepoStructure | undefined {
  return accountStructure?.repos[repoKey.repoId]
}

export function getRepoStructure(
  refData: UserScopeReferenceData,
  repoKey: GitHubRepoKey
): GithubRepoStructure | undefined {
  return getRepoStructureFromAccount(getAccountStructure(refData, repoKey.accountId), repoKey)
}

export function getWorkflowFromRepo(
  repoStructure: GithubRepoStructure | undefined,
  workflowKey: GitHubWorkflowKey
): GithubWorkflow | undefined {
  return repoStructure?.workflows[workflowKey.workflowId]
}

export function getWorkflowFromRefData(
  refData: UserScopeReferenceData,
  workflowKey: GitHubWorkflowKey
): GithubWorkflow | undefined {
  return getWorkflowFromRepo(getRepoStructure(refData, workflowKey), workflowKey)
}

export function allAccountIDsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount.accountId, ...(Object.keys(refData.publicAccounts) as GitHubAccountId[])]
}

export function allAccountsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount, ...Object.values(refData.publicAccounts)]
}
