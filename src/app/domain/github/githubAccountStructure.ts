import { AppState } from '../../environment/AppState'
import { GithubUserId } from '../types/GithubUserId'
import { getIdsOfAccountsWhichUserIsMemberOf } from './githubMembership'
import {
  GithubAccountStructure,
  GithubInstallationAccountStructure,
  GithubRepoStructure
} from '../types/GithubAccountStructure'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity'
import { getRepositoriesForAccount, repoKeysEqual, toRepoSummary } from './githubRepo'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoId } from '../types/GithubRepoId'
import { latestWorkflowRunEventsPerWorkflowForAccount } from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { getPublicAccountsForInstallationAccount } from '../entityStore/entities/GithubPublicAccountEntity'
import { GithubAccountSummary, GithubWorkflowSummary } from '../types/GithubSummaries'
import { toAccountSummary } from './githubAccount'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { GithubRepo } from '../types/GithubRepo'
import { GithubWorkflow } from '../types/GithubWorkflow'

export async function loadInstallationAccountStructureForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubInstallationAccountStructure> {
  // TOEventually - support user being a member of more than one account
  return loadInstallationAccountStructure(
    appState,
    (await getIdsOfAccountsWhichUserIsMemberOf(appState, userId))[0]
  )
}

export async function loadInstallationAccountStructure(
  appState: AppState,
  accountId: GithubAccountId
): Promise<GithubInstallationAccountStructure> {
  return {
    ...(await loadAccountStructure(appState, await getInstallationOrThrow(appState.entityStore, accountId))),
    publicAccounts: await loadPublicAccountsStructure(appState, accountId)
  }
}

async function loadAccountStructure(
  appState: AppState,
  account: GithubAccountSummary
): Promise<GithubAccountStructure> {
  return {
    ...toAccountSummary(account),
    repos: await loadReposStructure(appState, account.accountId)
  }
}

async function loadPublicAccountsStructure(
  appState: AppState,
  accountId: GithubAccountId
): Promise<Record<GithubAccountId, GithubAccountStructure>> {
  const allPublicAccountStructure: Record<GithubAccountId, GithubAccountStructure> = {}
  const allPublicAccounts = await getPublicAccountsForInstallationAccount(appState.entityStore, accountId)
  for (const publicAccount of allPublicAccounts) {
    allPublicAccountStructure[publicAccount.accountId] = await loadAccountStructure(appState, publicAccount)
  }
  return allPublicAccountStructure
}

async function loadReposStructure(
  appState: AppState,
  accountId: GithubAccountId
): Promise<Record<GithubRepoId, GithubRepoStructure>> {
  const allRepos = await getRepositoriesForAccount(appState, accountId)
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

export function accountStructureFromInstallationAccountStructure(
  installation: GithubInstallationAccountStructure,
  accountId: GithubAccountId
): GithubAccountStructure | undefined {
  return installation.accountId === accountId ? installation : installation.publicAccounts[accountId]
}

export function repoStructureFromInstallationAccountStructure(
  installation: GithubInstallationAccountStructure,
  repoKey: GithubRepoKey
): GithubRepoStructure | undefined {
  return accountStructureFromInstallationAccountStructure(installation, repoKey.accountId)?.repos[
    repoKey.repoId
  ]
}

export function workflowSummaryFromInstallationAccountStructure(
  installation: GithubInstallationAccountStructure,
  workflowKey: GithubWorkflowKey
): GithubWorkflowSummary | undefined {
  return repoStructureFromInstallationAccountStructure(installation, workflowKey)?.workflows[
    workflowKey.workflowId
  ]
}

export function allAccountIDsFromStructure(
  installation: GithubInstallationAccountStructure
): GithubAccountId[] {
  return [installation.accountId, ...(Object.keys(installation.publicAccounts) as GithubAccountId[])]
}
