import { GITHUB_LATEST_WORKFLOW_RUN_EVENT } from '../entityTypes.js'
import {
  AllEntitiesStore,
  rangeWhereSkBeginsWith,
  typePredicateParser
} from '@symphoniacloud/dynamodb-entity-store'
import { sortBy } from '../../../util/collections.js'
import { workflowRunEventUpdatedTimestamp } from '../../github/githubWorkflowRunEvent.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId, GitHubRepoKey, GitHubWorkflowRunEvent } from '../../../ioTypes/GitHubTypes.js'
import { isGitHubWorkflowRunEvent } from '../../../ioTypes/GitHubTypeChecks.js'

const GithubLatestWorkflowRunEventEntity: CicadaEntity<
  GitHubWorkflowRunEvent,
  Pick<GitHubWorkflowRunEvent, 'accountId'>,
  Pick<GitHubWorkflowRunEvent, 'repoId' | 'workflowId'>
> = {
  type: GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  parse: typePredicateParser(isGitHubWorkflowRunEvent, GITHUB_LATEST_WORKFLOW_RUN_EVENT),
  pk(source: Pick<GitHubWorkflowRunEvent, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubWorkflowRunEvent, 'repoId' | 'workflowId'>) {
    return `${skPrefix(source)}#WORKFLOW#${source.workflowId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GitHubWorkflowRunEvent, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GitHubWorkflowRunEvent, 'runEventUpdatedAt'>) {
        return `DATETIME#${source.runEventUpdatedAt}`
      }
    }
  }
}

function skPrefix({ repoId }: Pick<GitHubWorkflowRunEvent, 'repoId'>) {
  return `REPO#${repoId}`
}

export async function putRunEventIfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  event: GitHubWorkflowRunEvent
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
  repoKey: GitHubRepoKey
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
