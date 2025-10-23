import { GITHUB_LATEST_WORKFLOW_RUN_EVENT } from '../entityTypes.js'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent.js'
import {
  AllEntitiesStore,
  rangeWhereSkBeginsWith,
  typePredicateParser
} from '@symphoniacloud/dynamodb-entity-store'
import { GitHubAccountId } from '../../../types/GitHubIdTypes.js'
import { GithubRepoKey } from '../../types/GithubKeys.js'
import { sortBy } from '../../../util/collections.js'
import { workflowRunEventUpdatedTimestamp } from '../../github/githubWorkflowRunEvent.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'

const GithubLatestWorkflowRunEventEntity: CicadaEntity<
  GithubWorkflowRunEvent,
  Pick<GithubWorkflowRunEvent, 'accountId'>,
  Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>
> = {
  type: GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  parse: typePredicateParser(isGithubWorkflowRunEvent, GITHUB_LATEST_WORKFLOW_RUN_EVENT),
  pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>) {
    return `${skPrefix(source)}#WORKFLOW#${source.workflowId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubWorkflowRunEvent, 'runEventUpdatedAt'>) {
        return `DATETIME#${source.runEventUpdatedAt}`
      }
    }
  }
}

function skPrefix({ repoId }: Pick<GithubWorkflowRunEvent, 'repoId'>) {
  return `REPO#${repoId}`
}

export async function putRunEventIfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  event: GithubWorkflowRunEvent
) {
  return await store(entityStore).put(event, {
    conditionExpression: 'attribute_not_exists(PK) OR #runEventUpdatedAt < :newRunEventUpdatedAt',
    expressionAttributeNames: { '#runEventUpdatedAt': 'runEventUpdatedAt' },
    expressionAttributeValues: { ':newRunEventUpdatedAt': event.runEventUpdatedAt }
  })
}

export async function latestWorkflowRunEventsPerWorkflowForAccount(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
) {
  return store(entityStore).queryAllWithGsiByPk(
    { accountId },
    {
      scanIndexForward: false
    }
  )
}

export async function latestWorkflowRunEventsPerWorkflowForRepo(
  entityStore: AllEntitiesStore,
  repoKey: GithubRepoKey
) {
  const latestEvents = await store(entityStore).queryAllByPkAndSk(
    repoKey,
    rangeWhereSkBeginsWith(skPrefix(repoKey))
  )
  return sortBy(latestEvents, workflowRunEventUpdatedTimestamp, false)
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubLatestWorkflowRunEventEntity)
}
