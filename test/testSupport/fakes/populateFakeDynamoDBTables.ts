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
import { fakeTableNames } from './fakeCicadaConfig.js'
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
  appState.dynamoDB.putToTable(
    fakeTableNames['github-installations'],
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  )
}

export function populateFakeGitHubUserTokensTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-user-tokens'],
    buildGitHubUserTokenItem(testTestUserTokenRecord)
  )
}

export function populateFakeGitHubUsersTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(fakeTableNames['github-users'], buildGitHubUserItem(testTestUser))
}

export function populateFakeGitHubAccountMembershipsTable(appState: FakeAppState) {
  for (const membership of [testTestUserMembershipOfOrg, testMikeRobertsUserMembershipOfOrg]) {
    appState.dynamoDB.putToTable(
      fakeTableNames['github-account-memberships'],
      buildGitHubAccountMembershipItem(membership)
    )
  }
}

export function populateFakeGitHubUserAndAssociatedTables(appState: FakeAppState) {
  populateFakeGitHubUserTokensTable(appState)
  populateFakeGitHubUsersTable(appState)
  populateFakeGitHubAccountMembershipsTable(appState)
}

export function populateFakeGitHubRepositoriesTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(fakeTableNames['github-repositories'], buildGitHubRepoItem(testOrgTestRepoOne))
}

export function populateFakeGitHubWorkflowsTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-workflows'],
    buildGitHubWorkflowItem(testOrgTestWorkflowOne)
  )
}

export function populateFakeGitHubLatestWorkflowRunsTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-latest-workflow-runs'],
    buildGitHubWorkflowRunEventInLatest(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function populateFakeGitHubRepoActivityTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-repo-activity'],
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function populateFakeGitHubLatestPushesPerRefTable(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-latest-pushes-per-ref'],
    buildGitHubPushItemInLatestPushPerRef(testOrgTestRepoOnePush)
  )
}

export function populateFakeWebPushSubscriptionsTable(appState: FakeAppState) {
  for (const subscription of [
    testTestUserPushSubscription,
    testMikeRobertsPushSubscriptionTwo,
    testMikeRobertsPushSubscriptionThree
  ]) {
    appState.dynamoDB.putToTable(
      fakeTableNames['web-push-subscriptions'],
      buildWebPushSubscription({
        ...subscription
      })
    )
  }
}
