import { AllEntitiesStore, Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_PUBLIC_ACCOUNT } from '../entityTypes'
import { GithubPublicAccount, isGithubPublicAccount } from '../../types/GithubPublicAccount'
import { GithubAccountId } from '../../types/GithubKeys'

export const GithubPublicAccountEntity: Entity<
  GithubPublicAccount,
  Pick<GithubPublicAccount, 'installationAccountId'>,
  Pick<GithubPublicAccount, 'accountId'>
> = {
  type: GITHUB_PUBLIC_ACCOUNT,
  parse: typePredicateParser(isGithubPublicAccount, GITHUB_PUBLIC_ACCOUNT),
  pk(source: Pick<GithubPublicAccount, 'installationAccountId'>) {
    return `INSTALLATION_ACCOUNT#${source.installationAccountId}`
  },
  sk(source: Pick<GithubPublicAccount, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  }
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubPublicAccountEntity)
}

export async function savePublicAccount(entityStore: AllEntitiesStore, account: GithubPublicAccount) {
  return await store(entityStore).put(account)
}

export async function getPublicAccountsForInstallationAccount(
  entityStore: AllEntitiesStore,
  installationAccountId: GithubAccountId
) {
  return await store(entityStore).queryAllByPk({ installationAccountId })
}

export async function getPublicAccount(
  entityStore: AllEntitiesStore,
  installationAccountId: GithubAccountId,
  accountId: GithubAccountId
) {
  return await store(entityStore).getOrUndefined({
    installationAccountId,
    accountId
  })
}
