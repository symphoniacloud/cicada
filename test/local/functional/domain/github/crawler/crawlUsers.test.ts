import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import {
  testMikeRobertsUser,
  testMikeRobertsUserMembershipOfOrg,
  cicadaTestOrgInstallation,
  cicadaTestUserInstallation,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserMembershipOfPersonalInstallation
} from '../../../../../examples/cicada/githubDomainObjects.js'

import example_personal_account_user from '../../../../../examples/github/personal-account/api/user.json' with { type: 'json' }
import example_org_users from '../../../../../examples/github/org/api/users.json' with { type: 'json' }
import { crawlUsers } from '../../../../../../src/app/domain/github/crawler/crawlUsers.js'
import { stubQueryAccountMembershipsByAccount } from '../../../../../testSupport/fakes/tableRecordReadStubs.js'
import {
  expectBatchWrites,
  expectBatchWritesLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedBatchDeleteGithubMemberships,
  expectedBatchWriteGithubMemberships,
  expectedBatchWriteGithubUsers
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'
import { successWith } from '../../../../../../src/app/util/structuredResult.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubUserId
} from '../../../../../../src/app/domain/types/toFromRawGitHubIds.js'

test('user-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubUsers.addResponse(
    'cicada-test-user',
    successWith(example_personal_account_user)
  )

  // A
  await crawlUsers(appState, cicadaTestUserInstallation, githubInstallationClient)

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
  githubInstallationClient.stubOrganizationMembers.addResponse('cicada-test-org', example_org_users)

  stubQueryAccountMembershipsByAccount(appState, [
    testTestUserMembershipOfOrg,
    // Old membership that will be deleted
    { ...testTestUserMembershipOfOrg, userId: fromRawGithubUserId(9786) }
  ])

  // A
  await crawlUsers(appState, cicadaTestOrgInstallation, githubInstallationClient)

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
        accountId: fromRawGitHubAccountId(162483619),
        userId: fromRawGithubUserId(9786)
      }
    ])
  )
})
