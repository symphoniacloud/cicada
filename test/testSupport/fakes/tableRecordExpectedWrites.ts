import {
  buildBatchDelete,
  buildBatchWriteForEntity,
  buildDelete,
  buildPut
} from './dynamoDB/fakeDynamoDBInterfaceExpectations'
import { GithubInstallation } from '../../../src/app/domain/types/GithubInstallation'
import { GithubPush } from '../../../src/app/domain/types/GithubPush'
import { GithubRepository } from '../../../src/app/domain/types/GithubRepository'
import { GithubWorkflowRunEvent } from '../../../src/app/domain/types/GithubWorkflowRunEvent'
import { GithubUser } from '../../../src/app/domain/types/GithubUser'
import { GithubAccountMembership } from '../../../src/app/domain/types/GithubAccountMembership'
import { GithubAccountId, GithubUserId } from '../../../src/app/domain/types/GithubKeys'
import { WebPushSubscription } from '../../../src/app/domain/types/WebPushSubscription'

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

export function expectedBatchWriteGithubUsers(users: GithubUser[]) {
  return buildBatchWriteForEntity(
    'fakeGithubUsersTable',
    'githubUser',
    users.map((user) => ({
      PK: `USER#${user.id}`,
      ...user
    }))
  )
}

export function expectedBatchWriteGithubMemberships(memberships: GithubAccountMembership[]) {
  return buildBatchWriteForEntity(
    'fakeGithubAccountMemberships',
    'githubAccountMembership',
    memberships.map((membership) => ({
      PK: `ACCOUNT#${membership.accountId}`,
      SK: `USER#${membership.userId}`,
      GSI1PK: `USER#${membership.userId}`,
      GSI1SK: `ACCOUNT#${membership.accountId}`,
      ...membership
    }))
  )
}

export function expectedBatchDeleteGithubMemberships(
  memberships: { accountId: GithubAccountId; userId: GithubUserId }[]
) {
  return buildBatchDelete(
    'fakeGithubAccountMemberships',
    memberships.map(({ accountId, userId }) => ({
      PK: `ACCOUNT#${accountId}`,
      SK: `USER#${userId}`
    }))
  )
}

export function expectedPutWebPushSubscription(subscription: WebPushSubscription) {
  return buildPut('fakeWebPushSubscriptions', 'webPushSubscription', {
    PK: `USER#${subscription.userId}`,
    SK: `ENDPOINT#${subscription.endpoint}`,
    ...subscription
  })
}

export function expectedDeleteWebPushSubscription(subscription: WebPushSubscription) {
  return buildDelete('fakeWebPushSubscriptions', {
    PK: `USER#${subscription.userId}`,
    SK: `ENDPOINT#${subscription.endpoint}`
  })
}
