import { AllEntitiesStore, Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_PUBLIC_ACCOUNT } from '../entityTypes'
import { GithubPublicAccount, isGithubPublicAccount } from '../../types/GithubPublicAccount'
import { GithubAccountId } from '../../types/GithubKeys'

export const GithubPublicAccountEntity: Entity<
  GithubPublicAccount,
  Pick<GithubPublicAccount, 'ownerAccountId'>,
  Pick<GithubPublicAccount, 'accountId'>
> = {
  type: GITHUB_PUBLIC_ACCOUNT,
  parse: typePredicateParser(isGithubPublicAccount, GITHUB_PUBLIC_ACCOUNT),
  pk(source: Pick<GithubPublicAccount, 'ownerAccountId'>) {
    return `OWNER_ACCOUNT#${source.ownerAccountId}`
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

export async function getPublicAccountsForOwner(
  entityStore: AllEntitiesStore,
  ownerAccountId: GithubAccountId
) {
  return await store(entityStore).queryAllByPk({ ownerAccountId })
}

export async function getPublicAccount(
  entityStore: AllEntitiesStore,
  ownerAccountId: GithubAccountId,
  accountId: GithubAccountId
) {
  return await store(entityStore).getOrUndefined({
    ownerAccountId,
    accountId
  })
}