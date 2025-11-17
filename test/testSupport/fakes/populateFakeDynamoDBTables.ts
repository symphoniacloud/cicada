import { FakeAppState } from './fakeAppState.js'
import {
  cicadaTestOrgInstallation,
  testMikeRobertsUserMembershipOfOrg,
  testOrgTestRepoOne,
  testOrgTestRepoOnePush,
  testOrgTestRepoOneWorkflowRunThree,
  testOrgTestWorkflowOne,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserTokenRecord
} from '../../examples/cicada/githubDomainObjects.js'
import {
  testMikeRobertsPushSubscriptionThree,
  testMikeRobertsPushSubscriptionTwo,
  testTestUserPushSubscription
} from '../../examples/cicada/webPushDomainObjects.js'
import {
  buildGitHubAccountMembershipItem,
  buildGitHubInstallationItem,
  buildGitHubPushItemInLatestPushPerRef,
  buildGitHubRepoItem,
  buildGitHubUserItem,
  buildGitHubUserTokenItem,
  buildGitHubWorkflowItem,
  buildGitHubWorkflowRunEventInLatest,
  buildGitHubWorkflowRunItemInRepoActivity,
  buildWebPushSubscription
} from '../builders/dynamoDBItemBuilders.js'

export function populateFakeGithubInstallationTable(appState: FakeAppState) {
  appState.putToTable('github-installations', buildGitHubInstallationItem(cicadaTestOrgInstallation))
}

export function populateFakeGitHubUserTokensTable(appState: FakeAppState) {
  appState.putToTable('github-user-tokens', buildGitHubUserTokenItem(testTestUserTokenRecord))
}

export function populateFakeGitHubUsersTable(appState: FakeAppState) {
  appState.putToTable('github-users', buildGitHubUserItem(testTestUser))
}

export function populateFakeGitHubAccountMembershipsTable(appState: FakeAppState) {
  for (const membership of [testTestUserMembershipOfOrg, testMikeRobertsUserMembershipOfOrg]) {
    appState.putToTable('github-account-memberships', buildGitHubAccountMembershipItem(membership))
  }
}

export function populateFakeGitHubUserAndAssociatedTables(appState: FakeAppState) {
  populateFakeGitHubUserTokensTable(appState)
  populateFakeGitHubUsersTable(appState)
  populateFakeGitHubAccountMembershipsTable(appState)
}

export function populateFakeGitHubRepositoriesTable(appState: FakeAppState) {
  appState.putToTable('github-repositories', buildGitHubRepoItem(testOrgTestRepoOne))
}

export function populateFakeGitHubWorkflowsTable(appState: FakeAppState) {
  appState.putToTable('github-workflows', buildGitHubWorkflowItem(testOrgTestWorkflowOne))
}

export function populateFakeGitHubLatestWorkflowRunsTable(appState: FakeAppState) {
  appState.putToTable(
    'github-latest-workflow-runs',
    buildGitHubWorkflowRunEventInLatest(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function populateFakeGitHubRepoActivityTable(appState: FakeAppState) {
  appState.putToTable(
    'github-repo-activity',
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function populateFakeGitHubLatestPushesPerRefTable(appState: FakeAppState) {
  appState.putToTable(
    'github-latest-pushes-per-ref',
    buildGitHubPushItemInLatestPushPerRef(testOrgTestRepoOnePush)
  )
}

export function populateFakeWebPushSubscriptionsTable(appState: FakeAppState) {
  for (const subscription of [
    testTestUserPushSubscription,
    testMikeRobertsPushSubscriptionTwo,
    testMikeRobertsPushSubscriptionThree
  ]) {
    appState.putToTable('web-push-subscriptions', buildWebPushSubscription({ ...subscription }))
  }
}
