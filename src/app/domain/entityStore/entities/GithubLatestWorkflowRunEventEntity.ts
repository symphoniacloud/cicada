import { GITHUB_LATEST_WORKFLOW_RUN_EVENT } from '../entityTypes'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent'
import {
  AllEntitiesStore,
  Entity,
  rangeWhereSkBeginsWith,
  typePredicateParser
} from '@symphoniacloud/dynamodb-entity-store'
import { GithubAccountId } from '../../types/GithubAccountId'
import { GithubRepoKey, GithubWorkflowKey } from '../../types/GithubKeys'
import { sortBy } from '../../../util/collections'
import { getEventUpdatedTimestamp } from '../../github/githubCommon'

export const GithubLatestWorkflowRunEventEntity: Entity<
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
    return `${githubLatestWorkflowRunEventSkPrefix(source)}#WORKFLOW#${source.workflowId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubWorkflowRunEvent, 'updatedAt'>) {
        return `DATETIME#${source.updatedAt}`
      }
    }
  }
}

export function githubLatestWorkflowRunEventSkPrefix({ repoId }: Pick<GithubWorkflowRunEvent, 'repoId'>) {
  return `REPO#${repoId}`
}

export async function putIfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  event: GithubWorkflowRunEvent
) {
  await store(entityStore).put(event, {
    conditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
    expressionAttributeNames: { '#updatedAt': 'updatedAt' },
    expressionAttributeValues: { ':newUpdatedAt': event.updatedAt }
  })
}

export async function latestWorkflowRunEventForWorkflow(
  entityStore: AllEntitiesStore,
  workflowKey: GithubWorkflowKey
) {
  return store(entityStore).getOrUndefined(workflowKey)
}

export async function latestWorkflowRunEventsPerWorkflowForAccount(
  entityStore: AllEntitiesStore,
  accountId: GithubAccountId
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
    rangeWhereSkBeginsWith(githubLatestWorkflowRunEventSkPrefix(repoKey))
  )
  return sortBy(latestEvents, getEventUpdatedTimestamp, false)
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubLatestWorkflowRunEventEntity)
}
