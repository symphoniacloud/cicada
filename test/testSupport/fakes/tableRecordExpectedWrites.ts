import { buildBatchWriteForEntity, buildPut } from './dynamoDB/fakeDynamoDBInterfaceExpectations'
import { GithubInstallation } from '../../../src/app/domain/types/GithubInstallation'
import { GithubPush } from '../../../src/app/domain/types/GithubPush'
import { GithubRepository } from '../../../src/app/domain/types/GithubRepository'
import { GithubWorkflowRunEvent } from '../../../src/app/domain/types/GithubWorkflowRunEvent'

export function expectedPutGithubInstallation(installation: GithubInstallation) {
  return buildPut('fakeGithubInstallationsTable', 'githubInstallation', {
    PK: `ACCOUNT#${installation.accountId}`,
    ...installation
  })
}

export function expectedPutGithubPush(push: GithubPush) {
  return buildPut(
    'fakeGithubRepoActivityTable',
    'githubPush',
    {
      PK: `ACCOUNT#${push.ownerId}`,
      SK: `REPO#${push.repoId}#REF#${push.ref}#PUSH#COMMIT#${push.commits[0].sha}`,
      GSI1PK: `ACCOUNT#${push.ownerId}`,
      GSI1SK: `REPO#${push.repoId}#DATETIME#${push.dateTime}`,
      ...push
    },
    {
      ConditionExpression: 'attribute_not_exists(PK)'
    }
  )
}

export function expectedPutLatestGithubPush(push: GithubPush) {
  return buildPut(
    'fakeGithubLatestPushesPerRefTable',
    'githubLatestPushPerRef',
    {
      PK: `ACCOUNT#${push.ownerId}`,
      SK: `REPO#${push.repoId}#REF#${push.ref}`,
      GSI1PK: `ACCOUNT#${push.ownerId}`,
      GSI1SK: `DATETIME#${push.dateTime}`,
      ...push
    },
    {
      ConditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
      ExpressionAttributeNames: {
        '#dateTime': 'dateTime'
      },
      ExpressionAttributeValues: {
        ':newDateTime': push.dateTime
      }
    }
  )
}

export function expectedPutGithubWorkflowRunEvent(event: GithubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubRepoActivityTable',
    'githubWorkflowRunEvent',
    {
      PK: `ACCOUNT#${event.ownerId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN_EVENT#UPDATED_AT#${event.updatedAt}#RUN#${event.id}#STATUS#${event.status}`,
      GSI1PK: `ACCOUNT#${event.ownerId}`,
      GSI1SK: `REPO#${event.repoId}#DATETIME#${event.updatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK)'
    }
  )
}

export function expectedPutGithubWorkflowRun(event: GithubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubRepoActivityTable',
    'githubWorkflowRun',
    {
      PK: `ACCOUNT#${event.ownerId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN#RUN#${event.id}`,
      GSI1PK: `ACCOUNT#${event.ownerId}`,
      GSI1SK: `REPO#${event.repoId}#DATETIME#${event.updatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':newUpdatedAt': event.updatedAt
      }
    }
  )
}

export function expectedPutLatestGithubWorkflowRunEvent(event: GithubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubLatestWorkflowRunsTable',
    'githubLatestWorkflowRunEvent',
    {
      PK: `ACCOUNT#${event.ownerId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}`,
      GSI1PK: `ACCOUNT#${event.ownerId}`,
      GSI1SK: `DATETIME#${event.updatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':newUpdatedAt': event.updatedAt
      }
    }
  )
}

export function expectedBatchWriteGithubRepositories(repos: GithubRepository[]) {
  return buildBatchWriteForEntity(
    'fakeGithubRepositoriesTable',
    'githubRepository',
    repos.map((repo) => ({
      PK: `OWNER#${repo.ownerId}`,
      SK: `REPO#${repo.id}`,
      ...repo
    }))
  )
}
