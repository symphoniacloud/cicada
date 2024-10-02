import { GITHUB_WORKFLOW_RUN } from '../entityTypes'
import { GithubWorkflowRunEvent, isGithubWorkflowRunEvent } from '../../types/GithubWorkflowRunEvent'
import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { githubWorkflowRunEventGsiSkPrefix } from './GithubWorkflowRunEventEntity'

// Stores the latest run event per workflow run
export const GithubWorkflowRunEntity: Entity<
  GithubWorkflowRunEvent,
  Pick<GithubWorkflowRunEvent, 'accountId'>,
  Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId' | 'workflowRunId'>
> = {
  type: GITHUB_WORKFLOW_RUN,
  parse: typePredicateParser(isGithubWorkflowRunEvent, GITHUB_WORKFLOW_RUN),
  pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'workflowId' | 'workflowRunId'>) {
    return `REPO#${source.repoId}#WORKFLOW#${source.workflowId}#WORKFLOW_RUN#RUN#${source.workflowRunId}`
  },
  gsis: {
    // Used when getting all activity per repo, so shared with GithubPushEntity
    gsi1: {
      pk(source: Pick<GithubWorkflowRunEvent, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubWorkflowRunEvent, 'repoId' | 'updatedAt'>) {
        return `${githubWorkflowRunEventGsiSkPrefix(source)}#DATETIME#${source.updatedAt}`
      }
    }
  }
}
