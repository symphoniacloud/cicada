import { expect, test } from 'vitest'
import {
  calculateAccountSettings,
  calculateRepoSettings,
  calculateSettings,
  calculateUserSettings
} from '../../../../../src/app/domain/user/calculatedUserSettings'
import {
  CalculatedVisibleAndNotifyConfigurable,
  PersistedGithubAccountSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../../../../src/app/domain/types/UserSettings'
import { fromRawGithubUserId } from '../../../../../src/app/domain/types/GithubUserId'
import {
  buildAccountStructure,
  buildInstallationAccountStructure,
  buildRepoStructure,
  buildWorkflowSummary
} from '../../../../testSupport/builders/accountStructureBuilders'

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
    expect(calculateSettings(settings, defaultNotify)).toEqual(expected)
  })
})

test('repo settings when no workflow settings', () => {
  const repoStructure = buildRepoStructure()

  const calculated = calculateRepoSettings({ workflows: {} }, repoStructure, true)

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
  const repoStructure = buildRepoStructure()

  const calculated = calculateRepoSettings(
    { workflows: { GHWorkflow789: { notify: false } } },
    repoStructure,
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
  const repoStructure = buildRepoStructure()

  const calculated = calculateRepoSettings(
    { workflows: { GHWorkflow789: { notify: false } }, visible: false },
    repoStructure,
    true
  )

  expect(calculated).toEqual({
    visible: false,
    notify: false,
    workflows: {}
  })
})

test('repo settings when visible true notify false', () => {
  const repoStructure = buildRepoStructure({
    workflows: [buildWorkflowSummary(), buildWorkflowSummary({ simpleWorkflowId: 790 })]
  })

  const calculated = calculateRepoSettings(
    {
      workflows: {
        GHWorkflow789: { notify: true },
        GHWorkflow790: {}
      },
      visible: true,
      notify: false
    },
    repoStructure,
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
  const accountStructure = buildAccountStructure({
    repos: [
      buildRepoStructure(),
      buildRepoStructure({ simpleRepoId: 499, workflows: [buildWorkflowSummary({ simpleWorkflowId: 799 })] })
    ]
  })

  const calculated = calculateAccountSettings(undefined, accountStructure)

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    repos: {
      GHRepo456: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow789: {
            notify: true,
            visible: true
          }
        }
      },
      GHRepo499: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow799: {
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
      GHRepo499: {
        visible: false,
        notify: false,
        workflows: {}
      }
    }
  }

  const accountStructure = buildAccountStructure({
    repos: [
      buildRepoStructure(),
      buildRepoStructure({ simpleRepoId: 499, workflows: [buildWorkflowSummary({ simpleWorkflowId: 799 })] })
    ]
  })

  const calculated = calculateAccountSettings(persistedAccountSettings, accountStructure)

  expect(calculated).toEqual({
    visible: true,
    notify: true,
    repos: {
      GHRepo456: {
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow789: {
            notify: true,
            visible: true
          }
        }
      },
      GHRepo499: {
        visible: false,
        notify: false,
        workflows: {}
      }
    }
  })
})

test('user settings when empty persisted', () => {
  const accountStructure = buildInstallationAccountStructure({
    repos: [
      buildRepoStructure(),
      buildRepoStructure({ simpleRepoId: 499, workflows: [buildWorkflowSummary({ simpleWorkflowId: 799 })] })
    ]
  })

  const calculated = calculateUserSettings(
    {
      userId: fromRawGithubUserId(222),
      github: {
        accounts: {}
      }
    },
    accountStructure
  )

  expect(calculated).toEqual({
    userId: fromRawGithubUserId(222),
    github: {
      accounts: {
        GHAccount123: {
          visible: true,
          notify: true,
          repos: {
            GHRepo456: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow789: {
                  notify: true,
                  visible: true
                }
              }
            },
            GHRepo499: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow799: {
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
  const accountStructure = buildInstallationAccountStructure({
    repos: [
      buildRepoStructure(),
      buildRepoStructure({ simpleRepoId: 499, workflows: [buildWorkflowSummary({ simpleWorkflowId: 799 })] })
    ]
  })

  const calculated = calculateUserSettings(
    {
      userId: fromRawGithubUserId(222),
      github: {
        accounts: {
          GHAccount123: {
            repos: {
              GHRepo499: {
                visible: false,
                notify: false,
                workflows: {}
              }
            }
          }
        }
      }
    },
    accountStructure
  )

  expect(calculated).toEqual({
    userId: fromRawGithubUserId(222),
    github: {
      accounts: {
        GHAccount123: {
          visible: true,
          notify: true,
          repos: {
            GHRepo456: {
              visible: true,
              notify: true,
              workflows: {
                GHWorkflow789: {
                  notify: true,
                  visible: true
                }
              }
            },
            GHRepo499: {
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
