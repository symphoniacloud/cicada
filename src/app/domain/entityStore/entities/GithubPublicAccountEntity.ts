import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_PUBLIC_ACCOUNT } from '../entityTypes.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId, GitHubPublicAccount } from '../../../ioTypes/GitHubTypes.js'
import { isGitHubPublicAccount } from '../../../ioTypes/GitHubTypeChecks.js'

const GithubPublicAccountEntity: CicadaEntity<
  GitHubPublicAccount,
  Pick<GitHubPublicAccount, 'installationAccountId'>,
  Pick<GitHubPublicAccount, 'accountId'>
> = {
  type: GITHUB_PUBLIC_ACCOUNT,
  parse: typePredicateParser(isGitHubPublicAccount, GITHUB_PUBLIC_ACCOUNT),
  pk(source: Pick<GitHubPublicAccount, 'installationAccountId'>) {
    return `INSTALLATION_ACCOUNT#${source.installationAccountId}`
  },
  sk(source: Pick<GitHubPublicAccount, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  }
}

export async function putPublicAccount(entityStore: AllEntitiesStore, account: GitHubPublicAccount) {
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
