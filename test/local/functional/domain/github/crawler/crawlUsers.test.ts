import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'
import {
  testMikeRobertsUser,
  testMikeRobertsUserMembershipOfOrg,
  testOrgInstallation,
  testPersonalInstallation,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserMembershipOfPersonalInstallation
} from '../../../../../examples/cicada/githubDomainObjects'

import example_personal_account_user from '../../../../../examples/github/personal-account/api/user.json'
import example_org_users from '../../../../../examples/github/org/api/users.json'
import { crawlUsers } from '../../../../../../src/app/domain/github/crawler/crawlUsers'
import { stubQueryAccountMembershipsByAccount } from '../../../../../testSupport/fakes/tableRecordReadStubs'
import {
  expectBatchWrites,
  expectBatchWritesLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedBatchDeleteGithubMemberships,
  expectedBatchWriteGithubMemberships,
  expectedBatchWriteGithubUsers
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

test('user-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48093071, githubInstallationClient)
  githubInstallationClient.stubUsers.addResponse('cicada-test-user', example_personal_account_user)

  // A
  await crawlUsers(appState, testPersonalInstallation)

  // A
  expectBatchWritesLength(appState).toEqual(2)
  expectBatchWrites(appState, 0).toEqual(expectedBatchWriteGithubUsers([testTestUser]))
  expectBatchWrites(appState, 1).toEqual(
    expectedBatchWriteGithubMemberships([testTestUserMembershipOfPersonalInstallation])
  )
})

test('user-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubOrganizationMembers.addResponse('cicada-test-org', example_org_users)

  stubQueryAccountMembershipsByAccount(appState, [
    testTestUserMembershipOfOrg,
    // Old membership that will be deleted
    { ...testTestUserMembershipOfOrg, userId: 9786 }
  ])

  // A
  await crawlUsers(appState, testOrgInstallation)

  // A
  expectBatchWritesLength(appState).toEqual(3)
  expectBatchWrites(appState, 0).toEqual(expectedBatchWriteGithubUsers([testTestUser, testMikeRobertsUser]))
  expectBatchWrites(appState, 1).toEqual(
    expectedBatchWriteGithubMemberships([testMikeRobertsUserMembershipOfOrg])
  )
  // No longer a member
  expectBatchWrites(appState, 2).toEqual(
    expectedBatchDeleteGithubMemberships([
      {
        accountId: 162483619,
        userId: 9786
      }
    ])
  )
})
