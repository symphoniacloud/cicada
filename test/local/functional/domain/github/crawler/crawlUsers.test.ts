import { expect, test } from 'vitest'
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

test('user-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48093071, githubInstallationClient)
  githubInstallationClient.stubUsers.addResponse('cicada-test-user', example_personal_account_user)

  // A
  await crawlUsers(appState, testPersonalInstallation)

  // A
  expect(appState.dynamoDB.batchWrites.length).toEqual(2)
  expect(appState.dynamoDB.batchWrites[0]).toEqual({
    RequestItems: {
      fakeGithubUsersTable: [
        {
          PutRequest: {
            Item: {
              PK: 'USER#162360409',
              _et: 'githubUser',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testTestUser
            }
          }
        }
      ]
    }
  })
  expect(appState.dynamoDB.batchWrites[1]).toEqual({
    RequestItems: {
      fakeGithubAccountMemberships: [
        {
          PutRequest: {
            Item: {
              GSI1PK: 'USER#162360409',
              GSI1SK: 'ACCOUNT#162360409',
              PK: 'ACCOUNT#162360409',
              SK: 'USER#162360409',
              _et: 'githubAccountMembership',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testTestUserMembershipOfPersonalInstallation
            }
          }
        }
      ]
    }
  })
})

test('user-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubOrganizationMembers.addResponse('cicada-test-org', example_org_users)

  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubAccountMemberships',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619' }
    },
    [
      {
        $metadata: {},
        Items: [
          {
            _et: 'githubAccountMembership',
            ...testTestUserMembershipOfOrg
          },
          // Old membership that will be deleted
          {
            _et: 'githubAccountMembership',
            ...testTestUserMembershipOfOrg,
            userId: 9786
          }
        ]
      }
    ]
  )

  // A
  await crawlUsers(appState, testOrgInstallation)

  // A
  expect(appState.dynamoDB.batchWrites.length).toEqual(3)
  expect(appState.dynamoDB.batchWrites[0]).toEqual({
    RequestItems: {
      fakeGithubUsersTable: [
        {
          PutRequest: {
            Item: {
              PK: 'USER#162360409',
              _et: 'githubUser',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testTestUser
            }
          }
        },
        {
          PutRequest: {
            Item: {
              PK: 'USER#49635',
              _et: 'githubUser',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testMikeRobertsUser
            }
          }
        }
      ]
    }
  })
  // Previous membership for testTestUserMembershipOfOrg can remain unchanged
  expect(appState.dynamoDB.batchWrites[1]).toEqual({
    RequestItems: {
      fakeGithubAccountMemberships: [
        {
          PutRequest: {
            Item: {
              GSI1PK: 'USER#49635',
              GSI1SK: 'ACCOUNT#162483619',
              PK: 'ACCOUNT#162483619',
              SK: 'USER#49635',
              _et: 'githubAccountMembership',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testMikeRobertsUserMembershipOfOrg
            }
          }
        }
      ]
    }
  })
  // No longer a member
  expect(appState.dynamoDB.batchWrites[2]).toEqual({
    RequestItems: {
      fakeGithubAccountMemberships: [
        {
          DeleteRequest: {
            Key: {
              PK: 'ACCOUNT#162483619',
              SK: 'USER#9786'
            }
          }
        }
      ]
    }
  })
})
