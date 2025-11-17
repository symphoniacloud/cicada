import {
  GitHubAccountMembership,
  GitHubInstallation,
  GitHubPush,
  GitHubRepo,
  GitHubUser,
  GitHubUserToken,
  GitHubWorkflow,
  GitHubWorkflowRunEvent
} from '../../../src/app/ioTypes/GitHubTypes.js'
import { WebPushSubscription } from '../../../src/app/ioTypes/WebPushSchemasAndTypes.js'
import { EntityType } from '../../../src/app/domain/entityStore/entityTypes.js'
import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'

// This file replicates some the logic in the Entity code, so if changing there you'll need to change here too

export function buildItem(entityType: EntityType, item: Record<string, NativeAttributeValue>) {
  return {
    _et: entityType,
    _lastUpdated: '2024-02-02T19:00:00.000Z',
    ...item
  }
}

export function buildGitHubInstallationItem(installation: GitHubInstallation) {
  return buildItem('githubInstallation', {
    PK: `ACCOUNT#${installation.accountId}`,
    ...installation
  })
}

export function buildGitHubUserItem(user: GitHubUser) {
  return buildItem('githubUser', {
    PK: `USER#${user.userId}`,
    ...user
  })
}

export function buildGitHubUserTokenItem(userToken: GitHubUserToken) {
  return buildItem('githubUserToken', {
    PK: `USER_TOKEN#${userToken.token}`,
    ...userToken
  })
}

export function buildGitHubAccountMembershipItem(membership: GitHubAccountMembership) {
  return buildItem('githubAccountMembership', {
    PK: `ACCOUNT#${membership.accountId}`,
    SK: `USER#${membership.userId}`,
    GSI1PK: `USER#${membership.userId}`,
    GSI1SK: `ACCOUNT#${membership.accountId}`,
    ...membership
  })
}

export function buildGitHubRepoItem(repo: GitHubRepo) {
  return buildItem('githubRepository', {
    PK: `ACCOUNT#${repo.accountId}`,
    SK: `REPO#${repo.repoId}`,
    ...repo
  })
}

export function buildGitHubWorkflowItem(workflow: GitHubWorkflow) {
  return buildItem('githubWorkflow', {
    PK: `ACCOUNT#${workflow.accountId}`,
    SK: `REPO#${workflow.repoId}#WORKFLOW#${workflow.workflowId}`,
    ...workflow
  })
}

export function buildGitHubPushItemInRepoActivity(push: GitHubPush) {
  return buildItem('githubPush', {
    PK: `ACCOUNT#${push.accountId}`,
    SK: `REPO#${push.repoId}#REF#${push.ref}#PUSH#HEADSHA#${push.headSha}`,
    GSI1PK: `ACCOUNT#${push.accountId}`,
    GSI1SK: `REPO#${push.repoId}#DATETIME#${push.dateTime}`,
    ...push
  })
}

export function buildGitHubPushItemInLatestPushPerRef(push: GitHubPush) {
  return buildItem('githubLatestPushPerRef', {
    PK: `ACCOUNT#${push.accountId}`,
    SK: `REPO#${push.repoId}#REF#${push.ref}`,
    GSI1PK: `ACCOUNT#${push.accountId}`,
    GSI1SK: `DATETIME#${push.dateTime}`,
    ...push
  })
}

export function buildGitHubWorkflowRunEventItemInRepoActivity(event: GitHubWorkflowRunEvent) {
  return buildItem('githubWorkflowRunEvent', {
    PK: `ACCOUNT#${event.accountId}`,
    SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN_EVENT#UPDATED_AT#${event.runEventUpdatedAt}#RUN#${event.workflowRunId}#STATUS#${event.status}`,
    GSI1PK: `ACCOUNT#${event.accountId}`,
    GSI1SK: `REPO#${event.repoId}#DATETIME#${event.runEventUpdatedAt}`,
    ...event
  })
}

export function buildGitHubWorkflowRunEventInLatest(event: GitHubWorkflowRunEvent) {
  return buildItem('githubLatestWorkflowRunEvent', {
    PK: `ACCOUNT#${event.accountId}`,
    SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}`,
    GSI1PK: `ACCOUNT#${event.accountId}`,
    GSI1SK: `DATETIME#${event.runEventUpdatedAt}`,
    ...event
  })
}

export function buildGitHubWorkflowRunItemInRepoActivity(event: GitHubWorkflowRunEvent) {
  return buildItem('githubWorkflowRun', {
    PK: `ACCOUNT#${event.accountId}`,
    SK: `REPO#${event.repoId}#WORKFLOW#${event.workflowId}#WORKFLOW_RUN#RUN#${event.workflowRunId}`,
    GSI1PK: `ACCOUNT#${event.accountId}`,
    GSI1SK: `REPO#${event.repoId}#DATETIME#${event.runEventUpdatedAt}`,
    ...event
  })
}

export function buildWebPushSubscription(subscription: WebPushSubscription) {
  return buildItem('webPushSubscription', {
    PK: `USER#${subscription.userId}`,
    SK: `ENDPOINT#${subscription.endpoint}`,
    ...subscription
  })
}
