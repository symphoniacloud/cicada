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
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_LATEST_PUSH_PER_REF,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT,
  GITHUB_REPOSITORY,
  GITHUB_WORKFLOW,
  GITHUB_WORKFLOW_RUN,
  WEB_PUSH_SUBSCRIPTION
} from '../../../src/app/domain/entityStore/entityTypes.js'
import { throwFunction } from '../../../src/multipleContexts/errors.js'
import { testTestUserPushSubscription } from '../../examples/cicada/webPushDomainObjects.js'
import { FakeDynamoDBInterfaceStubber, MetaDataProvider } from './dynamoDB/fakeDynamoDBInterfaceStubber.js'
import { fakeTableNames } from './fakeCicadaConfig.js'

import { fromRawGithubUserId } from '../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'

import { GitHubUserId } from '../../../src/app/ioTypes/GitHubTypes.js'
import { WebPushSubscription } from '../../../src/app/ioTypes/WebPushSchemasAndTypes.js'

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
    cicadaTestOrgInstallation
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

export function stubQueryWorkflows(appState: FakeAppState, workflows = [testOrgTestWorkflowOne]) {
  stubber(appState).queryAllPages.ofTableByPk(
    fakeTableNames['github-workflows'],
    'ACCOUNT#GHAccount162483619',
    workflows,
    GITHUB_WORKFLOW
  )
}

export function stubGetWorkflow(appState: FakeAppState, workflow = testOrgTestWorkflowOne) {
  stubber(appState).stubGet.byPkAndSk(
    fakeTableNames['github-workflows'],
    `ACCOUNT#${workflow.accountId}`,
    `REPO#${workflow.repoId}#WORKFLOW#${workflow.workflowId}`,
    workflow
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

export function stubQueryWebPushSubscription(
  appState: FakeAppState,
  options?: {
    userId?: GitHubUserId
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
