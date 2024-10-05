import { AppState } from '../../environment/AppState'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData'
import { getUnarchivedRepositoriesForAccount, repoKeysEqual, toRepoSummary } from './githubRepo'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoId } from '../types/GithubRepoId'
import { latestWorkflowRunEventsPerWorkflowForAccount } from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { getPublicAccountsForInstallationAccount } from '../entityStore/entities/GithubPublicAccountEntity'
import { GithubAccountSummary, GithubWorkflowSummary } from '../types/GithubSummaries'
import { toAccountSummary } from './githubAccount'
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
    memberAccount: await loadAccountStructure(appState, memberAccount),
    publicAccounts: await loadPublicAccountsStructure(appState, memberAccountId)
  }
}

export async function loadAccountStructure<TAccount extends GithubAccountSummary>(
  appState: AppState,
  account: TAccount
): Promise<GithubAccountStructure> {
  return {
    ...toAccountSummary(account),
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
    allPublicAccountStructure[publicAccount.accountId] = await loadAccountStructure(appState, publicAccount)
  }
  return allPublicAccountStructure
}

async function loadReposStructure(
  appState: AppState,
  accountId: GithubAccountId
): Promise<Record<GithubRepoId, GithubRepoStructure>> {
  const allRepos = await getUnarchivedRepositoriesForAccount(appState, accountId)
  const allWorkflows = await latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
  return Object.fromEntries(allRepos.map((repo) => [repo.repoId, buildRepoStructure(repo, allWorkflows)]))
}

function buildRepoStructure(repo: GithubRepo, allWorkflows: GithubWorkflow[]): GithubRepoStructure {
  return {
    ...toRepoSummary(repo),
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

export function getWorkflowStructureFromRepo(
  repoStructure: GithubRepoStructure | undefined,
  workflowKey: GithubWorkflowKey
): GithubWorkflowSummary | undefined {
  return repoStructure?.workflows[workflowKey.workflowId]
}

export function getWorkflowStructure(
  refData: UserScopeReferenceData,
  workflowKey: GithubWorkflowKey
): GithubWorkflowSummary | undefined {
  return getWorkflowStructureFromRepo(getRepoStructure(refData, workflowKey), workflowKey)
}

export function allAccountIDsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount.accountId, ...(Object.keys(refData.publicAccounts) as GithubAccountId[])]
}

export function allAccountsFromRefData(refData: UserScopeReferenceData) {
  return [refData.memberAccount, ...Object.values(refData.publicAccounts)]
}
