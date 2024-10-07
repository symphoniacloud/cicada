import { AppState } from '../../environment/AppState'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData'
import { getUnarchivedRepositoriesForAccount, narrowToRepoSummary, repoKeysEqual } from './githubRepo'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoId } from '../types/GithubRepoId'
import { getActiveWorkflowsForAccount } from './githubWorkflow'
import { getPublicAccountsForInstallationAccount } from '../entityStore/entities/GithubPublicAccountEntity'
import { GithubAccountSummary } from '../types/GithubSummaries'
import { narrowToAccountSummary } from './githubAccount'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { GithubRepo } from '../types/GithubRepo'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubUserId } from '../types/GithubUserId'
import { getInstalledAccountIdForUser } from './githubMembership'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity'

export async function loadUserScopeReferenceData(
  appState: AppState,
  userId: GithubUserId
): Promise<UserScopeReferenceData> {
  const memberAccountId = await getInstalledAccountIdForUser(appState, userId)
  const memberAccount = await getInstallationOrThrow(appState.entityStore, memberAccountId)

  return {
    userId,
    memberAccount: await loadAccountStructure(appState, memberAccount, true),
    publicAccounts: await loadPublicAccountsStructure(appState, memberAccountId)
  }
}

export async function loadAccountStructure<TAccount extends GithubAccountSummary>(
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
  accountId: GithubAccountId
): Promise<Record<GithubAccountId, GithubAccountStructure>> {
  const allPublicAccounts = await getPublicAccountsForInstallationAccount(appState.entityStore, accountId)
  const allPublicAccountStructure: Record<GithubAccountId, GithubAccountStructure> = {}
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
  accountId: GithubAccountId
): Promise<Record<GithubRepoId, GithubRepoStructure>> {
  const allRepos = await getUnarchivedRepositoriesForAccount(appState, accountId)
  const allWorkflows = await getActiveWorkflowsForAccount(appState, accountId)
  return Object.fromEntries(allRepos.map((repo) => [repo.repoId, buildRepoStructure(repo, allWorkflows)]))
}

function buildRepoStructure(repo: GithubRepo, allWorkflows: GithubWorkflow[]): GithubRepoStructure {
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
  accountId: GithubAccountId
): GithubAccountStructure | undefined {
  return refData.memberAccount.accountId === accountId
    ? refData.memberAccount
    : refData.publicAccounts[accountId]
}

export function getRepoStructureFromAccount(
  accountStructure: GithubAccountStructure | undefined,
  repoKey: GithubRepoKey
): GithubRepoStructure | undefined {
  return accountStructure?.repos[repoKey.repoId]
}

export function getRepoStructure(
  refData: UserScopeReferenceData,
  repoKey: GithubRepoKey
): GithubRepoStructure | undefined {
  return getRepoStructureFromAccount(getAccountStructure(refData, repoKey.accountId), repoKey)
}

export function getWorkflowFromRepo(
  repoStructure: GithubRepoStructure | undefined,
  workflowKey: GithubWorkflowKey
): GithubWorkflow | undefined {
  return repoStructure?.workflows[workflowKey.workflowId]
}

export function getWorkflowFromRefData(
  refData: UserScopeReferenceData,
  workflowKey: GithubWorkflowKey
): GithubWorkflow | undefined {
  return getWorkflowFromRepo(getRepoStructure(refData, workflowKey), workflowKey)
}

export function allAccountIDsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount.accountId, ...(Object.keys(refData.publicAccounts) as GithubAccountId[])]
}

export function allAccountsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount, ...Object.values(refData.publicAccounts)]
}
