import { FakeAppState } from './fakeAppState.js'
import {
  accountMemberships,
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
import { throwFunction } from '../../../src/multipleContexts/errors.js'
import { testTestUserPushSubscription } from '../../examples/cicada/webPushDomainObjects.js'
import { fakeTableNames } from './fakeCicadaConfig.js'

import { GitHubUserId } from '../../../src/app/ioTypes/GitHubTypes.js'
import { WebPushSubscription } from '../../../src/app/ioTypes/WebPushSchemasAndTypes.js'
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
} from './itemBuilders.js'

export function stubGetGithubInstallation(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-installations'],
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  )
}

export function stubGetUserToken(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-user-tokens'],
    buildGitHubUserTokenItem(testTestUserTokenRecord)
  )
}

export function stubGetUser(appState: FakeAppState) {
  appState.dynamoDB.putToTable(fakeTableNames['github-users'], buildGitHubUserItem(testTestUser))
}

export function stubQueryAccountMembershipsByUser(
  appState: FakeAppState,
  userId = testTestUserMembershipOfOrg.userId
) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-account-memberships'],
    buildGitHubAccountMembershipItem(
      accountMemberships[userId] ?? throwFunction(`Test Setup Error - no account membership for ${userId}`)()
    )
  )
}

export function stubSetupUserRecords(appState: FakeAppState) {
  stubGetUserToken(appState)
  stubGetUser(appState)
  stubQueryAccountMembershipsByUser(appState)
}

export function stubQueryAccountMembershipsByAccount(
  appState: FakeAppState,
  memberships = [testTestUserMembershipOfOrg, testMikeRobertsUserMembershipOfOrg]
) {
  for (const membership of memberships) {
    appState.dynamoDB.putToTable(
      fakeTableNames['github-account-memberships'],
      buildGitHubAccountMembershipItem(membership)
    )
  }
}

export function stubQueryRepositories(appState: FakeAppState) {
  appState.dynamoDB.putToTable(fakeTableNames['github-repositories'], buildGitHubRepoItem(testOrgTestRepoOne))
}

export function stubQueryWorkflows(appState: FakeAppState, workflows = [testOrgTestWorkflowOne]) {
  for (const workflow of workflows) {
    appState.dynamoDB.putToTable(fakeTableNames['github-workflows'], buildGitHubWorkflowItem(workflow))
  }
}

export function stubQueryLatestWorkflowRuns(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-latest-workflow-runs'],
    buildGitHubWorkflowRunEventInLatest(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function stubQueryLatestWorkflowRunsForRepo(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-latest-workflow-runs'],
    buildGitHubWorkflowRunEventInLatest(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function stubQueryActivityForRepo(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-repo-activity'],
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestRepoOneWorkflowRunThree)
  )
}

export function stubQueryLatestPushesPerRef(appState: FakeAppState) {
  appState.dynamoDB.putToTable(
    fakeTableNames['github-latest-pushes-per-ref'],
    buildGitHubPushItemInLatestPushPerRef(testOrgTestRepoOnePush)
  )
}

export function stubQueryWebPushSubscription(
  appState: FakeAppState,
  options?: {
    userId?: GitHubUserId
    subscriptions?: WebPushSubscription[]
  }
) {
  for (const subscription of options?.subscriptions ?? [testTestUserPushSubscription]) {
    appState.dynamoDB.putToTable(
      fakeTableNames['web-push-subscriptions'],
      buildWebPushSubscription({
        ...subscription
      })
    )
  }
}
