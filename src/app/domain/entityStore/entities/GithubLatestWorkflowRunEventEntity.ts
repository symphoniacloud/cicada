import { GITHUB_LATEST_WORKFLOW_RUN_EVENT } from '../entityTypes'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent'
import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'

export const GithubLatestWorkflowRunEventEntity: Entity<
  GithubWorkflowRunEvent,
  Pick<GithubWorkflowRunEvent, 'ownerId'>,
  Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>
> = {
  type: GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  parse: typePredicateParser(isGithubWorkflowRunEvent, GITHUB_LATEST_WORKFLOW_RUN_EVENT),
  pk(source: Pick<GithubWorkflowRunEvent, 'ownerId'>) {
    return `ACCOUNT#${source.ownerId}`
  },
  sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId'>) {
    return `${githubLatestWorkflowRunEventSkPrefix(source)}#WORKFLOW#${source.workflowId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'ownerId'>) {
        return `ACCOUNT#${source.ownerId}`
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
