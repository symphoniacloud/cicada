import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_PUBLIC_ACCOUNT } from '../entityTypes.js'
import { GithubPublicAccount, isGithubPublicAccount } from '../../types/GithubPublicAccount.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId } from '../../../types/GitHubTypes.js'

const GithubPublicAccountEntity: CicadaEntity<
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

export async function putPublicAccount(entityStore: AllEntitiesStore, account: GithubPublicAccount) {
  return await store(entityStore).put(account)
}

export async function getPublicAccountsForInstallationAccount(
  entityStore: AllEntitiesStore,
  installationAccountId: GitHubAccountId
) {
  return await store(entityStore).queryAllByPk({ installationAccountId })
}

export async function getPublicAccount(
  entityStore: AllEntitiesStore,
  installationAccountId: GitHubAccountId,
  accountId: GitHubAccountId
) {
  return await store(entityStore).getOrUndefined({
    installationAccountId,
    accountId
  })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubPublicAccountEntity)
}
