import { FakeAppState } from './fakeAppState'
import {
  accountMemberships,
  testMikeRobertsUserMembershipOfOrg,
  testOrgInstallation,
  testOrgTestRepoOne,
  testOrgTestRepoOnePush,
  testOrgTestRepoOneWorkflowRunThree,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserTokenRecord
} from '../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_LATEST_PUSH_PER_REF,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  GITHUB_REPOSITORY,
  GITHUB_WORKFLOW_RUN,
  WEB_PUSH_SUBSCRIPTION
} from '../../../src/app/domain/entityStore/entityTypes'
import { throwFunction } from '../../../src/multipleContexts/errors'
import { testTestUserPushSubscription } from '../../examples/cicada/webPushDomainObjects'
import { WebPushSubscription } from '../../../src/app/domain/types/WebPushSubscription'
import { FakeDynamoDBInterfaceStubber, MetaDataProvider } from './dynamoDB/fakeDynamoDBInterfaceStubber'
import { fakeTableNames } from './fakeCicadaConfig'

import { fromRawGithubUserId, GithubUserId } from '../../../src/app/domain/types/GithubUserId'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const metaDataProvider: MetaDataProvider = (_tableName: string) => {
  return {
    pk: 'PK',
    sk: 'SK',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    indexName: (_indexId?: string) => 'GSI1',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    indexPk: (_indexId?: string) => 'GSI1PK',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    indexSk: (_indexId?: string) => 'GSI1SK'
  }
}

function stubber(appState: FakeAppState) {
  return new FakeDynamoDBInterfaceStubber(appState.dynamoDB, metaDataProvider)
}

export function stubGetGithubInstallation(appState: FakeAppState) {
  stubber(appState).stubGet.byPk(
    fakeTableNames['github-installations'],
    'ACCOUNT#GHAccount162483619',
    testOrgInstallation
  )
}

export function stubGetUserToken(appState: FakeAppState) {
  stubber(appState).stubGet.byPk(
    fakeTableNames['github-user-tokens'],
    'USER_TOKEN#validUserToken',
    testTestUserTokenRecord
  )
}

export function stubGetUser(appState: FakeAppState) {
  stubber(appState).stubGet.byPk(
    fakeTableNames['github-users'],
    `USER#${fromRawGithubUserId(162360409)}`,
    testTestUser
  )
}

export function stubQueryAccountMembershipsByUser(
  appState: FakeAppState,
  userId = testTestUserMembershipOfOrg.userId
) {
  stubber(appState).queryAllPages.ofIndexPyPk(
    fakeTableNames['github-account-memberships'],
    `USER#${userId}`,
    [accountMemberships[userId] ?? throwFunction(`Test Setup Error - no account membership for ${userId}`)()],
    GITHUB_ACCOUNT_MEMBERSHIP
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
  stubber(appState).queryAllPages.ofTableByPk(
    fakeTableNames['github-account-memberships'],
    'ACCOUNT#GHAccount162483619',
    memberships,
    GITHUB_ACCOUNT_MEMBERSHIP
  )
}

export function stubQueryRepositories(appState: FakeAppState) {
  stubber(appState).queryAllPages.ofTableByPk(
    fakeTableNames['github-repositories'],
    'ACCOUNT#GHAccount162483619',
    [testOrgTestRepoOne],
    GITHUB_REPOSITORY
  )
}

export function stubQueryLatestWorkflowRuns(appState: FakeAppState) {
  stubber(appState).queryAllPages.ofIndexPyPk(
    fakeTableNames['github-latest-workflow-runs'],
    'ACCOUNT#GHAccount162483619',
    [testOrgTestRepoOneWorkflowRunThree],
    GITHUB_LATEST_WORKFLOW_RUN_EVENT,
    false
  )
}

export function stubQueryLatestWorkflowRunsForRepo(appState: FakeAppState) {
  stubber(appState).queryAllPages.ofTableByPkAndSk(
    fakeTableNames['github-latest-workflow-runs'],
    'begins_with(#sk, :skPrefix)',
    'ACCOUNT#GHAccount162483619',
    { ':skPrefix': 'REPO#GHRepo768206479' },
    [testOrgTestRepoOneWorkflowRunThree],
    GITHUB_LATEST_WORKFLOW_RUN_EVENT
  )
}

export function stubQueryActivityForRepo(appState: FakeAppState) {
  stubber(appState).queryOnePage.ofIndexPyPkAndSk(
    fakeTableNames['github-repo-activity'],
    'begins_with(#sk, :skPrefix)',
    'ACCOUNT#GHAccount162483619',
    { ':skPrefix': 'REPO#GHRepo768206479' },
    [testOrgTestRepoOneWorkflowRunThree],
    GITHUB_WORKFLOW_RUN,
    false
  )
}

export function stubQueryLatestPushesPerRef(appState: FakeAppState) {
  stubber(appState).queryAllPages.ofIndexPyPkAndSk(
    fakeTableNames['github-latest-pushes-per-ref'],
    '#sk > :sk',
    'ACCOUNT#GHAccount162483619',
    { ':sk': 'DATETIME#2024-01-19T19:00:00.000Z' },
    [testOrgTestRepoOnePush],
    GITHUB_LATEST_PUSH_PER_REF,
    false
  )
}

export function stubGetRepo(appState: FakeAppState) {
  stubber(appState).stubGet.byPkAndSk(
    fakeTableNames['github-repositories'],
    'ACCOUNT#GHAccount162483619',
    'REPO#GHRepo768206479',
    testOrgTestRepoOne
  )
}

export function stubQueryWebPushSubscription(
  appState: FakeAppState,
  options?: {
    userId?: GithubUserId
    subscriptions?: WebPushSubscription[]
  }
) {
  stubber(appState).queryAllPages.ofTableByPk(
    fakeTableNames['web-push-subscriptions'],
    `USER#${options?.userId ?? fromRawGithubUserId(162360409)}`,
    options?.subscriptions ?? [testTestUserPushSubscription],
    WEB_PUSH_SUBSCRIPTION
  )
}
