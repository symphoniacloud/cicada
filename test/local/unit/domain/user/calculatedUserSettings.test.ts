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
import { fromRawGithubAccountId } from '../../../../../src/app/domain/types/GithubAccountId'
import { fromRawGithubUserId } from '../../../../../src/app/domain/types/GithubUserId'
import { fromRawGithubRepoId } from '../../../../../src/app/domain/types/GithubRepoId'
import { fromRawGithubWorkflowId } from '../../../../../src/app/domain/types/GithubWorkflowId'

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
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
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
      GHWorkflow789: {
        visible: true,
        notify: true
      }
    }
  })
})

test('repo settings when workflow settings', () => {
  const calculated = calculateRepoSettings(
    { workflows: { GHWorkflow789: { notify: false } } },
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
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
      GHWorkflow789: {
        visible: true,
        notify: false
      }
    }
  })
})

test('repo settings when visible false', () => {
  const calculated = calculateRepoSettings(
    { workflows: { GHWorkflow789: { notify: false } }, visible: false },
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
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
        GHWorkflow789: { notify: true },
        GHWorkflow790: {}
      },
      visible: true,
      notify: false
    },
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(790),
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
      GHWorkflow789: { visible: true, notify: true },
      GHWorkflow790: { visible: true, notify: false }
    }
  })
})

test('account settings when none persisted', () => {
  const calculated = calculateAccountSettings(
    undefined,
    fromRawGithubAccountId(111),
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123)
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456)
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(790),
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
      GHRepo123: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow789: {
            notify: true,
            visible: true
          }
        }
      },
      GHRepo456: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow790: {
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
      GHRepo123: {
        workflows: {}
      },
      GHRepo456: {
        visible: false,
        notify: false,
        workflows: {}
      }
    }
  }

  const calculated = calculateAccountSettings(
    persistedAccountSettings,
    fromRawGithubAccountId(111),
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123)
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456)
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(790),
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
      GHRepo123: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow789: {
            notify: true,
            visible: true
          }
        }
      },
      GHRepo456: {
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
      userId: fromRawGithubUserId(222),
      github: {
        accounts: {}
      }
    },
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123)
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456)
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(790),
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    userId: fromRawGithubUserId(222),
    github: {
      accounts: {
        GHAccount111: {
          visible: true,
          notify: true,
          repos: {
            GHRepo123: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow789: {
                  notify: true,
                  visible: true
                }
              }
            },
            GHRepo456: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow790: {
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
      userId: fromRawGithubUserId(222),
      github: {
        accounts: {
          GHAccount111: {
            repos: {
              GHRepo456: {
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
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123)
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456)
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(123),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      },
      {
        accountId: fromRawGithubAccountId(111),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(790),
        workflowName: 'workflow2',
        accountType: USER_ACCOUNT_TYPE,
        accountName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated).toEqual({
    userId: fromRawGithubUserId(222),
    github: {
      accounts: {
        GHAccount111: {
          visible: true,
          notify: true,
          repos: {
            GHRepo123: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow789: {
                  notify: true,
                  visible: true
                }
              }
            },
            GHRepo456: {
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
