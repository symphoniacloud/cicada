import { expect, test } from 'vitest'
import { USER_ACCOUNT_TYPE } from '../../../../../src/app/domain/types/GithubAccountType'
import {
  toCalculatedAndDisplayableUserSettings,
  toDisplayableAccountSettings,
  toDisplayableRepoSettings,
  toDisplayableWorkflowSettings
} from '../../../../../src/app/domain/user/displayableUserSettings'

test('toDisplayableWorkflowSettings', () => {
  const displayable = toDisplayableWorkflowSettings(
    { ownerId: 123, repoId: 456, workflowId: 789 },
    {
      visible: true,
      notify: true
    },
    [
      {
        ownerId: 123,
        repoId: 456,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    visible: true,
    notify: true,
    name: 'workflow1'
  })
})

test('toDisplayableRepoSettings', () => {
  const displayable = toDisplayableRepoSettings(
    { ownerId: 123, repoId: 456 },
    {
      visible: true,
      notify: true,
      workflows: {
        789: {
          visible: true,
          notify: true
        }
      }
    },
    [
      {
        ownerId: 123,
        repoId: 456,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: 'repo1',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    name: 'repo1',
    visible: true,
    notify: true,
    workflows: {
      789: {
        visible: true,
        notify: true,
        name: 'workflow1'
      }
    }
  })
})

test('toDisplayableAccountSettings', () => {
  const displayable = toDisplayableAccountSettings(
    123,
    {
      visible: true,
      notify: true,
      repos: {
        456: {
          visible: true,
          notify: true,
          workflows: {
            789: {
              visible: true,
              notify: true
            }
          }
        }
      }
    },
    [
      {
        ownerId: 123,
        repoId: 456,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: 'account1',
        repoName: 'repo1',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    name: 'account1',
    visible: true,
    notify: true,
    repos: {
      456: {
        name: 'repo1',
        visible: true,
        notify: true,
        workflows: {
          789: {
            visible: true,
            notify: true,
            name: 'workflow1'
          }
        }
      }
    }
  })
})

test('toCalculatedAndDisplayableUserSettings', () => {
  const displayable = toCalculatedAndDisplayableUserSettings(
    {
      userId: 111,
      github: {
        accounts: {
          123: {
            repos: {
              456: {
                notify: false,
                workflows: {}
              }
            }
          }
        }
      }
    },
    [
      {
        ownerId: 123,
        repoId: 456,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: 'account1',
        repoName: 'repo1',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    userId: 111,
    github: {
      accounts: {
        123: {
          name: 'account1',
          visible: true,
          notify: true,
          repos: {
            456: {
              name: 'repo1',
              visible: true,
              notify: false,
              workflows: {
                789: {
                  visible: true,
                  notify: false,
                  name: 'workflow1'
                }
              }
            }
          }
        }
      }
    }
  })
})
