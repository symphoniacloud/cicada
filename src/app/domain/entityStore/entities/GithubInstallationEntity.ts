import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubInstallation, isGithubInstallation } from '../../types/GithubInstallation'
import { GITHUB_INSTALLATION } from '../entityTypes'
import { GithubAccountId } from '../../types/GithubAccountId'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport'

const GithubInstallationEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_INSTALLATION,
  parse: typePredicateParser(isGithubInstallation, GITHUB_INSTALLATION),
  pk(source: Pick<GithubInstallation, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  }
})

export async function putInstallation(
  entityStore: AllEntitiesStore,
  installation: GithubInstallation
): Promise<GithubInstallation> {
  return store(entityStore).put(installation)
}

export async function getInstallationOrUndefined(
  entityStore: AllEntitiesStore,
  accountId: GithubAccountId
): Promise<GithubInstallation | undefined> {
  return store(entityStore).getOrUndefined({ accountId })
}

export async function getInstallationOrThrow(
  entityStore: AllEntitiesStore,
  accountId: GithubAccountId
): Promise<GithubInstallation> {
  return store(entityStore).getOrThrow({ accountId })
}

export async function getAllInstallations(entityStore: AllEntitiesStore): Promise<GithubInstallation[]> {
  return store(entityStore).scanAll()
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubInstallationEntity)
}
