import { GITHUB_WORKFLOW_RUN_EVENT } from '../entityTypes'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent'
import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'

// We will eventually get several of these per actual run - e.g. started, completed, etc
// Multiple events per run might have same ID but we differentiate by updated_time and status (this allows for same second multiple events)
export const GithubWorkflowRunEventEntity: Entity<
  GithubWorkflowRunEvent,
  Pick<GithubWorkflowRunEvent, 'ownerId'>,
  Pick<GithubWorkflowRunEvent, 'repoId' | 'updatedAt' | 'workflowId' | 'id' | 'status'>
> = {
  type: GITHUB_WORKFLOW_RUN_EVENT,
  parse: typePredicateParser(isGithubWorkflowRunEvent, GITHUB_WORKFLOW_RUN_EVENT),
  pk(source: Pick<GithubWorkflowRunEvent, 'ownerId'>) {
    return `ACCOUNT#${source.ownerId}`
  },
  // UPDATED_AT goes before RUN_ID for when querying activity per workflow, by date
  sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'updatedAt' | 'workflowId' | 'id' | 'status'>) {
    return `${githubWorkflowRunEventSkPrefix(source)}#UPDATED_AT#${source.updatedAt}#RUN#${
      source.id
    }#STATUS#${source.status}`
  },
  gsis: {
    // Used when getting all activity per repo, so shared with GithubPushEntity
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'ownerId'>) {
        return `ACCOUNT#${source.ownerId}`
      },
      sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'updatedAt'>) {
        return `${githubWorkflowRunEventGsiSkPrefix(source)}#DATETIME#${source.updatedAt}`
      }
    }
  }
}

export function githubWorkflowRunEventSkPrefix({
  repoId,
  workflowId
}: Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>) {
  // We add #WORKFLOW_RUN_EVENT since in future we _might_ have workflow job events with similar structure
  return `REPO#${repoId}#WORKFLOW#${workflowId}#WORKFLOW_RUN_EVENT`
}

// Also used by GithubPushEntity
export function githubWorkflowRunEventGsiSkPrefix({ repoId }: Pick<GithubWorkflowRunEvent, 'repoId'>) {
  return `REPO#${repoId}`
}
