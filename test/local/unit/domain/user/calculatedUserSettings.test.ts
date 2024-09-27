import { expect, test } from 'vitest'
import {
  calculateAccountSettings,
  calculateRepoSettings,
  calculateUserSettings,
  calculateVisibleAndNotifyConfigurable
} from '../../../../../src/app/domain/user/calculatedUserSettings'
import {
  CalculatedVisibleAndNotifyConfigurable,
  PersistedGithubAccountSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../../../../src/app/domain/types/UserSettings'
import { USER_ACCOUNT_TYPE } from '../../../../../src/app/domain/types/GithubAccountType'

test('calculateVisibleAndNotifyConfigurable / calculateWorkflowSettings', () => {
  const permutations: [
    PersistedVisibleAndNotifyConfigurable | undefined,
    boolean,
    CalculatedVisibleAndNotifyConfigurable
  ][] = [
    [undefined, true, { visible: true, notify: true }],
    [undefined, false, { visible: true, notify: false }],
    [{ visible: false }, true, { visible: false, notify: false }],
    [{ visible: false }, false, { visible: false, notify: false }],
    [{ visible: false, notify: true }, true, { visible: false, notify: false }],
    [{ visible: false, notify: true }, false, { visible: false, notify: false }],
    [{ visible: false, notify: false }, true, { visible: false, notify: false }],
    [{ visible: false, notify: false }, false, { visible: false, notify: false }],
    [{ visible: true }, true, { visible: true, notify: true }],
    [{ visible: true }, false, { visible: true, notify: false }],
    [{ visible: true, notify: true }, true, { visible: true, notify: true }],
    [{ visible: true, notify: true }, false, { visible: true, notify: true }],
    [{ visible: true, notify: false }, true, { visible: true, notify: false }],
    [{ visible: true, notify: false }, false, { visible: true, notify: false }],
    [{ notify: true }, true, { visible: true, notify: true }],
    [{ notify: true }, false, { visible: true, notify: true }],
    [{ notify: false }, true, { visible: true, notify: false }],
    [{ notify: false }, false, { visible: true, notify: false }]
  ]

  permutations.forEach(([settings, defaultNotify, expected]) => {
    expect(calculateVisibleAndNotifyConfigurable(settings, defaultNotify)).toEqual(expected)
  })
})

test('repo settings when no workflow settings', () => {
  const calculated = calculateRepoSettings(
    { workflows: {} },
    { accountId: '123', repoId: '456' },
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
    ],
    true
  )

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    workflows: {
      '789': {
        visible: true,
        notify: true
      }
    }
  })
})

test('repo settings when workflow settings', () => {
  const calculated = calculateRepoSettings(
    { workflows: { '789': { notify: false } } },
    { accountId: '123', repoId: '456' },
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
    ],
    true
  )

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    workflows: {
      '789': {
        visible: true,
        notify: false
      }
    }
  })
})

test('repo settings when visible false', () => {
  const calculated = calculateRepoSettings(
    { workflows: { '789': { notify: false } }, visible: false },
    { accountId: '123', repoId: '456' },
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
    ],
    true
  )

  expect(calculated).toEqual({
    visible: false,
    notify: false,
    workflows: {}
  })
})

test('repo settings when visible true notify false', () => {
  const calculated = calculateRepoSettings(
    {
      workflows: {
        '789': { notify: true },
        '790': {}
      },
      visible: true,
      notify: false
    },
    { accountId: '123', repoId: '456' },
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
      },
      {
        accountId: '123',
        repoId: '456',
        workflowId: '790',
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ],
    true
  )

  expect(calculated).toEqual({
    visible: true,
    notify: false,
    workflows: {
      '789': { visible: true, notify: true },
      '790': { visible: true, notify: false }
    }
  })
})

test('account settings when none persisted', () => {
  const calculated = calculateAccountSettings(
    undefined,
    '111',
    [
      {
        accountId: '111',
        repoId: '123'
      },
      {
        accountId: '111',
        repoId: '456'
      }
    ],
    [
      {
        accountId: '111',
        repoId: '123',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: '111',
        repoId: '456',
        workflowId: '790',
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    repos: {
      '123': {
        visible: true,
        notify: true,
        workflows: {
          '789': {
            notify: true,
            visible: true
          }
        }
      },
      '456': {
        visible: true,
        notify: true,
        workflows: {
          '790': {
            notify: true,
            visible: true
          }
        }
      }
    }
  })
})

test('account settings ', () => {
  const persistedAccountSettings: PersistedGithubAccountSettings = {
    repos: {
      '123': {
        workflows: {}
      },
      '456': {
        visible: false,
        notify: false,
        workflows: {}
      }
    }
  }

  const calculated = calculateAccountSettings(
    persistedAccountSettings,
    '111',
    [
      {
        accountId: '111',
        repoId: '123'
      },
      {
        accountId: '111',
        repoId: '456'
      }
    ],
    [
      {
        accountId: '111',
        repoId: '123',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: '111',
        repoId: '456',
        workflowId: '790',
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    repos: {
      '123': {
        visible: true,
        notify: true,
        workflows: {
          '789': {
            notify: true,
            visible: true
          }
        }
      },
      '456': {
        visible: false,
        notify: false,
        workflows: {}
      }
    }
  })
})

test('user settings when empty persisted', () => {
  const calculated = calculateUserSettings(
    {
      userId: 222,
      github: {
        accounts: {}
      }
    },
    [
      {
        accountId: '111',
        repoId: '123'
      },
      {
        accountId: '111',
        repoId: '456'
      }
    ],
    [
      {
        accountId: '111',
        repoId: '123',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: '111',
        repoId: '456',
        workflowId: '790',
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    userId: 222,
    github: {
      accounts: {
        '111': {
          visible: true,
          notify: true,
          repos: {
            '123': {
              visible: true,
              notify: true,
              workflows: {
                '789': {
                  notify: true,
                  visible: true
                }
              }
            },
            '456': {
              visible: true,
              notify: true,
              workflows: {
                '790': {
                  notify: true,
                  visible: true
                }
              }
            }
          }
        }
      }
    }
  })
})

test('user settings when some persisted', () => {
  const calculated = calculateUserSettings(
    {
      userId: 222,
      github: {
        accounts: {
          '111': {
            repos: {
              '456': {
                visible: false,
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
        accountId: '111',
        repoId: '123'
      },
      {
        accountId: '111',
        repoId: '456'
      }
    ],
    [
      {
        accountId: '111',
        repoId: '123',
        workflowId: '789',
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: '111',
        repoId: '456',
        workflowId: '790',
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    userId: 222,
    github: {
      accounts: {
        '111': {
          visible: true,
          notify: true,
          repos: {
            '123': {
              visible: true,
              notify: true,
              workflows: {
                '789': {
                  notify: true,
                  visible: true
                }
              }
            },
            '456': {
              visible: false,
              notify: false,
              workflows: {}
            }
          }
        }
      }
    }
  })
})
