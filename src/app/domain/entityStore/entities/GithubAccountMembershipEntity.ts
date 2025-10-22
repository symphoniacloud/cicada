import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import {
  GithubAccountMembership,
  isGithubOrganizationMembership
} from '../../types/GithubAccountMembership.js'
import { GITHUB_ACCOUNT_MEMBERSHIP } from '../entityTypes.js'
import { GithubAccountId } from '../../types/GithubAccountId.js'
import { GithubUserId } from '../../types/GithubUserId.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'

const GithubAccountMembershipEntity: CicadaEntity<
  GithubAccountMembership,
  Pick<GithubAccountMembership, 'accountId'>,
  Pick<GithubAccountMembership, 'userId'>
> = {
  type: GITHUB_ACCOUNT_MEMBERSHIP,
  parse: typePredicateParser(isGithubOrganizationMembership, GITHUB_ACCOUNT_MEMBERSHIP),
  pk(source: Pick<GithubAccountMembership, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubAccountMembership, 'userId'>) {
    return `USER#${source.userId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubAccountMembership, 'userId'>) {
        return `USER#${source.userId}`
      },
      sk(source: Pick<GithubAccountMembership, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      }
    }
  }
}

export async function putMemberships(entityStore: AllEntitiesStore, memberships: GithubAccountMembership[]) {
  await store(entityStore).advancedOperations.batchPut(memberships)
}

export async function deleteMemberships(
  entityStore: AllEntitiesStore,
  memberships: GithubAccountMembership[]
) {
  await store(entityStore).advancedOperations.batchDelete(memberships)
}

export async function getAllMembershipsForAccount(entityStore: AllEntitiesStore, accountId: GithubAccountId) {
  return store(entityStore).queryAllByPk({ accountId })
}

export async function getAllMembershipsForUserId(entityStore: AllEntitiesStore, userId: GithubUserId) {
  return store(entityStore).queryAllWithGsiByPk({ userId }, { gsiId: 'gsi1' })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubAccountMembershipEntity)
}
