import { GITHUB_WORKFLOW_RUN_EVENT } from '../entityTypes.js'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent.js'
import {
  AllEntitiesStore,
  rangeWhereSkBeginsWith,
  typePredicateParser
} from '@symphoniacloud/dynamodb-entity-store'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GithubWorkflowKey } from '../../types/GithubKeys.js'
import { githubActivityEntityGSISk, githubActivityEntityPk } from './GithubWorkflowRunEntity.js'

// We will eventually get several of these per actual run - e.g. started, completed, etc
// Multiple events per run might have same ID but we differentiate by updated_time and status (this allows for same second multiple events)
// Stored in same table as Runs and Pushes
const GithubWorkflowRunEventEntity: CicadaEntity<
  GithubWorkflowRunEvent,
  Pick<GithubWorkflowRunEvent, 'accountId'>,
  Pick<GithubWorkflowRunEvent, 'repoId' | 'runEventUpdatedAt' | 'workflowId' | 'workflowRunId' | 'status'>
> = {
  type: GITHUB_WORKFLOW_RUN_EVENT,
  parse: typePredicateParser(isGithubWorkflowRunEvent, GITHUB_WORKFLOW_RUN_EVENT),
  pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  // UPDATED_AT goes before RUN_ID for when querying activity per workflow, by date
  sk(
    source: Pick<
      GithubWorkflowRunEvent,
      'repoId' | 'runEventUpdatedAt' | 'workflowId' | 'workflowRunId' | 'status'
    >
  ) {
    return `${skPrefix(source)}#UPDATED_AT#${source.runEventUpdatedAt}#RUN#${source.workflowRunId}#STATUS#${
      source.status
    }`
  },
  gsis: {
    // Shared format with GithubWorkflowRunEntity and GithubPushEntity
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
        return githubActivityEntityPk(source)
      },
      sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'runEventUpdatedAt'>) {
        return githubActivityEntityGSISk(source.repoId, source.runEventUpdatedAt)
      }
    }
  }
}

function skPrefix({ repoId, workflowId }: Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>) {
  // We add #WORKFLOW_RUN_EVENT since in future we _might_ have workflow job events with similar structure
  return `REPO#${repoId}#WORKFLOW#${workflowId}#WORKFLOW_RUN_EVENT`
}

export function putWorkflowRunEventIfKeyDoesntExist(
  entityStore: AllEntitiesStore,
  runEvent: GithubWorkflowRunEvent
) {
  return store(entityStore).put(runEvent, {
    conditionExpression: 'attribute_not_exists(PK)'
  })
}

// Returns *all* the run events for each run (including in_progress) even if the run is complete
// If you just want the most recent run event per run then use githubWorkflowRun.ts instead
// TODO - Use paged since otherwise could blow up with too-large result
export async function getRunEventsForWorkflow(entityStore: AllEntitiesStore, key: GithubWorkflowKey) {
  return store(entityStore).queryAllByPkAndSk(key, rangeWhereSkBeginsWith(skPrefix(key)), {
    scanIndexForward: false
  })
}

export async function getRunEventsForWorkflowPage(
  entityStore: AllEntitiesStore,
  { accountId, repoId, workflowId }: GithubWorkflowKey,
  limit?: number
) {
  return store(entityStore).queryOnePageByPkAndSk(
    { accountId },
    rangeWhereSkBeginsWith(skPrefix({ repoId, workflowId })),
    { scanIndexForward: false, ...(limit ? { limit } : {}) }
  )
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubWorkflowRunEventEntity)
}
