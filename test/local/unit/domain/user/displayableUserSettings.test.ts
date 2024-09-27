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
    { accountId: '123', repoId: '456', workflowId: '789' },
    {
      visible: true,
      notify: true
    },
    [
      {
        accountId: '123',
        repoId: '456',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
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
    { accountId: '123', repoId: '456' },
    {
      visible: true,
      notify: true,
      workflows: {
        '789': {
          visible: true,
          notify: true
        }
      }
    },
    [
      {
        accountId: '123',
        id: '456',
        accountName: 'account1',
        name: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: '123',
        repoId: '456',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
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
      '789': {
        visible: true,
        notify: true,
        name: 'workflow1'
      }
    }
  })
})

test('toDisplayableAccountSettings', () => {
  const displayable = toDisplayableAccountSettings(
    '123',
    {
      visible: true,
      notify: true,
      repos: {
        '456': {
          visible: true,
          notify: true,
          workflows: {
            '789': {
              visible: true,
              notify: true
            }
          }
        }
      }
    },
    [
      {
        accountId: '123',
        id: '456',
        accountName: 'account1',
        name: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: '123',
        repoId: '456',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: 'account1',
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
      '456': {
        name: 'repo1',
        visible: true,
        notify: true,
        workflows: {
          '789': {
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
          '123': {
            repos: {
              '456': {
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
        accountId: '123',
        id: '456',
        accountName: 'account1',
        name: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: '123',
        repoId: '456',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: 'account1',
        repoName: 'repo1',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    userId: 111,
    github: {
      accounts: {
        '123': {
          name: 'account1',
          visible: true,
          notify: true,
          repos: {
            '456': {
              name: 'repo1',
              visible: true,
              notify: false,
              workflows: {
                '789': {
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
