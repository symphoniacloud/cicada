import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_ACCOUNT_MEMBERSHIP } from '../entityTypes.js'
import { GitHubAccountId, GitHubUserId } from '../../../types/GitHubIdTypes.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountMembership, isGitHubOrganizationMembership } from '../../../types/GitHubObjectTypes.js'

const GithubAccountMembershipEntity: CicadaEntity<
  GitHubAccountMembership,
  Pick<GitHubAccountMembership, 'accountId'>,
  Pick<GitHubAccountMembership, 'userId'>
> = {
  type: GITHUB_ACCOUNT_MEMBERSHIP,
  parse: typePredicateParser(isGitHubOrganizationMembership, GITHUB_ACCOUNT_MEMBERSHIP),
  pk(source: Pick<GitHubAccountMembership, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubAccountMembership, 'userId'>) {
    return `USER#${source.userId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GitHubAccountMembership, 'userId'>) {
        return `USER#${source.userId}`
      },
      sk(source: Pick<GitHubAccountMembership, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      }
    }
  }
}

export async function putMemberships(entityStore: AllEntitiesStore, memberships: GitHubAccountMembership[]) {
  await store(entityStore).advancedOperations.batchPut(memberships)
}

export async function deleteMemberships(
  entityStore: AllEntitiesStore,
  memberships: GitHubAccountMembership[]
) {
  await store(entityStore).advancedOperations.batchDelete(memberships)
}

export async function getAllMembershipsForAccount(entityStore: AllEntitiesStore, accountId: GitHubAccountId) {
  return store(entityStore).queryAllByPk({ accountId })
}

export async function getAllMembershipsForUserId(entityStore: AllEntitiesStore, userId: GitHubUserId) {
  return store(entityStore).queryAllWithGsiByPk({ userId }, { gsiId: 'gsi1' })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubAccountMembershipEntity)
}
