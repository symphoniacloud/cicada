import { GITHUB_LATEST_PUSH_PER_REF } from '../entityTypes.js'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { rangeWhereSkGreaterThan } from '@symphoniacloud/dynamodb-entity-store'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId, GitHubPush } from '../../../ioTypes/GitHubTypes.js'
import { isGitHubPush } from '../../../ioTypes/GitHubTypeChecks.js'

const GithubLatestPushPerRefEntity: CicadaEntity<
  GitHubPush,
  Pick<GitHubPush, 'accountId'>,
  Pick<GitHubPush, 'repoId' | 'ref'>
> = {
  type: GITHUB_LATEST_PUSH_PER_REF,
  parse: typePredicateParser(isGitHubPush, GITHUB_LATEST_PUSH_PER_REF),
  pk(source: Pick<GitHubPush, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubPush, 'repoId' | 'ref'>) {
    return `REPO#${source.repoId}#REF#${source.ref}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GitHubPush, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GitHubPush, 'dateTime'>) {
        return generateGsiSK(source)
      }
    }
  }
}

function generateGsiSK({ dateTime }: Pick<GitHubPush, 'dateTime'>) {
  return `DATETIME#${dateTime}`
}

export async function putPushIfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  push: GitHubPush
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
