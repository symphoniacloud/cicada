import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import {
  cicadaTestOrgInstallation,
  cicadaTestUserInstallation,
  testMikeRobertsUser,
  testMikeRobertsUserMembershipOfOrg,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserMembershipOfPersonalInstallation
} from '../../../../../examples/cicada/githubDomainObjects.js'

import example_personal_account_user from '../../../../../examples/github/personal-account/api/user.json' with { type: 'json' }
import example_org_users from '../../../../../examples/github/org/api/users.json' with { type: 'json' }
import { crawlUsers } from '../../../../../../src/app/domain/github/crawler/crawlUsers.js'
import {
  buildGitHubAccountMembershipItem,
  buildGitHubUserItem
} from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'
import { successWith } from '../../../../../../src/app/util/structuredResult.js'
import { fromRawGithubUserId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import { RawGithubUserSchema } from '../../../../../../src/app/ioTypes/RawGitHubSchemas.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('user-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubUsers.addResponse(
    'cicada-test-user',
    successWith(RawGithubUserSchema.parse(example_personal_account_user))
  )

  // A
  await crawlUsers(appState, cicadaTestUserInstallation, githubInstallationClient)

  // A
  expect(appState.getAllFromTable('github-users')).toEqual([buildGitHubUserItem(testTestUser)])
  expect(appState.getAllFromTable('github-account-memberships')).toEqual([
    buildGitHubAccountMembershipItem(testTestUserMembershipOfPersonalInstallation)
  ])
})

test('user-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubOrganizationMembers.addResponse(
    'cicada-test-org',
    example_org_users.map((x) => RawGithubUserSchema.parse(x))
  )
  // Old membership that's still valid
  appState.dynamoDB.putToTable(
    fakeTableNames['github-account-memberships'],
    buildGitHubAccountMembershipItem(testTestUserMembershipOfOrg)
  )
  // Old membership that will be deleted
  appState.dynamoDB.putToTable(
    fakeTableNames['github-account-memberships'],
    buildGitHubAccountMembershipItem({ ...testTestUserMembershipOfOrg, userId: fromRawGithubUserId(9786) })
  )

  // A
  await crawlUsers(appState, cicadaTestOrgInstallation, githubInstallationClient)

  // A
  expect(appState.getAllFromTable('github-users')).toEqual([
    buildGitHubUserItem(testTestUser),
    buildGitHubUserItem(testMikeRobertsUser)
  ])
  // '9786' membership no longer in table
  expect(appState.getAllFromTable('github-account-memberships')).toEqual([
    buildGitHubAccountMembershipItem(testTestUserMembershipOfOrg),
    buildGitHubAccountMembershipItem(testMikeRobertsUserMembershipOfOrg)
  ])
})
