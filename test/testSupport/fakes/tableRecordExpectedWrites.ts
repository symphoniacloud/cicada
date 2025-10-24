import {
  buildBatchDelete,
  buildBatchWriteForEntity,
  buildDelete,
  buildPut
} from './dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import { GithubPush } from '../../../src/app/domain/types/GithubPush.js'
import { WebPushSubscription } from '../../../src/app/domain/types/WebPushSubscription.js'

import {
  GitHubAccountId,
  GitHubAccountMembership,
  GitHubInstallation,
  GitHubRepo,
  GitHubUser,
  GitHubUserId,
  GitHubWorkflow,
  GitHubWorkflowRunEvent
} from '../../../src/app/types/GitHubTypes.js'

export function expectedPutGithubInstallation(installation: GitHubInstallation) {
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
      PK: `ACCOUNT#${push.accountId}`,
      SK: `REPO#${push.repoId}#REF#${push.ref}#PUSH#COMMIT#${push.commits[0].sha}`,
      GSI1PK: `ACCOUNT#${push.accountId}`,
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
      PK: `ACCOUNT#${push.accountId}`,
      SK: `REPO#${push.repoId}#REF#${push.ref}`,
      GSI1PK: `ACCOUNT#${push.accountId}`,
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

export function expectedPutGithubWorkflow(workflow: GitHubWorkflow) {
  return buildPut('fakeGithubWorkflowTable', 'githubWorkflow', {
    PK: `ACCOUNT#${workflow.accountId}`,
    SK: `REPO#${workflow.repoId}#WORKFLOW#${workflow.workflowId}`,
    ...workflow
  })
}

export function expectedPutGithubWorkflowRunEvent(event: GitHubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubRepoActivityTable',
    'githubWorkflowRunEvent',
    {
      PK: `ACCOUNT#${event.accountId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN_EVENT#UPDATED_AT#${event.runEventUpdatedAt}#RUN#${event.workflowRunId}#STATUS#${event.status}`,
      GSI1PK: `ACCOUNT#${event.accountId}`,
      GSI1SK: `REPO#${event.repoId}#DATETIME#${event.runEventUpdatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK)'
    }
  )
}

export function expectedPutGithubWorkflowRun(event: GitHubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubRepoActivityTable',
    'githubWorkflowRun',
    {
      PK: `ACCOUNT#${event.accountId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN#RUN#${event.workflowRunId}`,
      GSI1PK: `ACCOUNT#${event.accountId}`,
      GSI1SK: `REPO#${event.repoId}#DATETIME#${event.runEventUpdatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK) OR #runEventUpdatedAt < :newRunEventUpdatedAt',
      ExpressionAttributeNames: {
        '#runEventUpdatedAt': 'runEventUpdatedAt'
      },
      ExpressionAttributeValues: {
        ':newRunEventUpdatedAt': event.runEventUpdatedAt
      }
    }
  )
}

export function expectedPutLatestGithubWorkflowRunEvent(event: GitHubWorkflowRunEvent) {
  return buildPut(
    'fakeGithubLatestWorkflowRunsTable',
    'githubLatestWorkflowRunEvent',
    {
      PK: `ACCOUNT#${event.accountId}`,
      SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}`,
      GSI1PK: `ACCOUNT#${event.accountId}`,
      GSI1SK: `DATETIME#${event.runEventUpdatedAt}`,
      ...event
    },
    {
      ConditionExpression: 'attribute_not_exists(PK) OR #runEventUpdatedAt < :newRunEventUpdatedAt',
      ExpressionAttributeNames: {
        '#runEventUpdatedAt': 'runEventUpdatedAt'
      },
      ExpressionAttributeValues: {
        ':newRunEventUpdatedAt': event.runEventUpdatedAt
      }
    }
  )
}

export function expectedBatchWriteGithubRepositories(repos: GitHubRepo[]) {
  return buildBatchWriteForEntity(
    'fakeGithubRepositoriesTable',
    'githubRepository',
    repos.map((repo) => ({
      PK: `ACCOUNT#${repo.accountId}`,
      SK: `REPO#${repo.repoId}`,
      ...repo
    }))
  )
}

export function expectedBatchWriteGithubUsers(users: GitHubUser[]) {
  return buildBatchWriteForEntity(
    'fakeGithubUsersTable',
    'githubUser',
    users.map((user) => ({
      PK: `USER#${user.userId}`,
      ...user
    }))
  )
}

export function expectedBatchWriteGithubMemberships(memberships: GitHubAccountMembership[]) {
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
  memberships: { accountId: GitHubAccountId; userId: GitHubUserId }[]
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
