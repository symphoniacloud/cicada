import { GITHUB_LATEST_PUSH_PER_REF } from '../entityTypes.js'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubPush, isGithubPush } from '../../types/GithubPush.js'
import { rangeWhereSkGreaterThan } from '@symphoniacloud/dynamodb-entity-store'
import { GitHubAccountId } from '../../../types/GitHubIdTypes.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'

const GithubLatestPushPerRefEntity: CicadaEntity<
  GithubPush,
  Pick<GithubPush, 'accountId'>,
  Pick<GithubPush, 'repoId' | 'ref'>
> = {
  type: GITHUB_LATEST_PUSH_PER_REF,
  parse: typePredicateParser(isGithubPush, GITHUB_LATEST_PUSH_PER_REF),
  pk(source: Pick<GithubPush, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubPush, 'repoId' | 'ref'>) {
    return `REPO#${source.repoId}#REF#${source.ref}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubPush, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubPush, 'dateTime'>) {
        return generateGsiSK(source)
      }
    }
  }
}

function generateGsiSK({ dateTime }: Pick<GithubPush, 'dateTime'>) {
  return `DATETIME#${dateTime}`
}

export async function putPushIfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  push: GithubPush
) {
  await store(entityStore).put(push, {
    conditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
    expressionAttributeNames: { '#dateTime': 'dateTime' },
    expressionAttributeValues: { ':newDateTime': push.dateTime }
  })
}

export async function queryRecentLatestPushesByAccount(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId,
  startOfTimeRange: string
) {
  return store(entityStore).queryAllWithGsiByPkAndSk(
    { accountId },
    rangeWhereSkGreaterThan(generateGsiSK({ dateTime: startOfTimeRange })),
    {
      scanIndexForward: false
    }
  )
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubLatestPushPerRefEntity)
}
