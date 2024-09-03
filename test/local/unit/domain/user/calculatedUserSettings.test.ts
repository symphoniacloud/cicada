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
  PersistedGithubRepoSettings,
  PersistedGithubWorkflowSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../../../../src/app/domain/types/UserSettings'
import {
  GithubAccountId,
  GithubRepoId,
  GithubWorkflowId
} from '../../../../../src/app/domain/types/GithubKeys'
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
    { workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>() },
    { ownerId: 123, repoId: 456 },
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
    ],
    true
  )
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.workflows.size).toEqual(1)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: true })
})

test('repo settings when workflow settings', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: false })
  const calculated = calculateRepoSettings(
    { workflows },
    { ownerId: 123, repoId: 456 },
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
    ],
    true
  )
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.workflows.size).toEqual(1)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: false })
})

test('repo settings when visible false', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: false })
  const calculated = calculateRepoSettings(
    { workflows, visible: false },
    { ownerId: 123, repoId: 456 },
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
    ],
    true
  )
  expect(calculated.visible).toEqual(false)
  expect(calculated.notify).toEqual(false)
  expect(calculated.workflows.size).toEqual(0)
})

test('repo settings when visible true notify false', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: true })
  workflows.set(790, {})
  const calculated = calculateRepoSettings(
    { workflows, visible: true, notify: false },
    { ownerId: 123, repoId: 456 },
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
      },
      {
        ownerId: 123,
        repoId: 456,
        workflowId: 790,
        workflowName: 'workflow2',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      }
    ],
    true
  )
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(false)
  expect(calculated.workflows.size).toEqual(2)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: true })
  expect(calculated.workflows.get(790)).toEqual({ visible: true, notify: false })
})

test('account settings when none persisted', () => {
  const calculated = calculateAccountSettings(undefined, 111, [
    {
      ownerId: 111,
      repoId: 123,
      workflowId: 789,
      workflowName: 'workflow1',
      ownerType: USER_ACCOUNT_TYPE,
      ownerName: '',
      repoName: '',
      path: ''
    },
    {
      ownerId: 111,
      repoId: 456,
      workflowId: 790,
      workflowName: 'workflow2',
      ownerType: USER_ACCOUNT_TYPE,
      ownerName: '',
      repoName: '',
      path: ''
    }
  ])

  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.repos.size).toEqual(2)
  expect(calculated.repos.get(123)?.visible).toEqual(true)
  expect(calculated.repos.get(123)?.notify).toEqual(true)
  expect(calculated.repos.get(456)?.visible).toEqual(true)
  expect(calculated.repos.get(456)?.notify).toEqual(true)
})

test('account settings ', () => {
  const persistedRepos = new Map<GithubRepoId, PersistedGithubRepoSettings>()
  persistedRepos.set(123, {
    workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  })
  persistedRepos.set(456, {
    visible: false,
    notify: false,
    workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  })

  const persistedAccountSettings: PersistedGithubAccountSettings = {
    repos: persistedRepos
  }

  const calculated = calculateAccountSettings(persistedAccountSettings, 111, [
    {
      ownerId: 111,
      repoId: 123,
      workflowId: 789,
      workflowName: 'workflow1',
      ownerType: USER_ACCOUNT_TYPE,
      ownerName: '',
      repoName: '',
      path: ''
    },
    {
      ownerId: 111,
      repoId: 456,
      workflowId: 790,
      workflowName: 'workflow2',
      ownerType: USER_ACCOUNT_TYPE,
      ownerName: '',
      repoName: '',
      path: ''
    }
  ])

  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.repos.size).toEqual(2)
  expect(calculated.repos.get(123)?.visible).toEqual(true)
  expect(calculated.repos.get(123)?.notify).toEqual(true)
  expect(calculated.repos.get(456)?.visible).toEqual(false)
  expect(calculated.repos.get(456)?.notify).toEqual(false)
})

test('user settings when empty persisted', () => {
  const calculated = calculateUserSettings(
    {
      userId: 222,
      github: {
        accounts: new Map<GithubAccountId, PersistedGithubAccountSettings>()
      }
    },
    [
      {
        ownerId: 111,
        repoId: 123,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      },
      {
        ownerId: 111,
        repoId: 456,
        workflowId: 790,
        workflowName: 'workflow2',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated.github.accounts.get(111)?.visible).toEqual(true)
  expect(calculated.github.accounts.get(111)?.notify).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.size).toEqual(2)
  expect(calculated.github.accounts.get(111)?.repos.get(123)?.visible).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.get(123)?.notify).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.get(456)?.visible).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.get(456)?.notify).toEqual(true)
})

test('user settings when some persisted', () => {
  const persistedRepos = new Map<GithubRepoId, PersistedGithubRepoSettings>()
  persistedRepos.set(456, {
    visible: false,
    notify: false,
    workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  })

  const persistedAccounts = new Map<GithubAccountId, PersistedGithubAccountSettings>()
  persistedAccounts.set(111, {
    repos: persistedRepos
  })

  const calculated = calculateUserSettings(
    {
      userId: 222,
      github: {
        accounts: persistedAccounts
      }
    },
    [
      {
        ownerId: 111,
        repoId: 123,
        workflowId: 789,
        workflowName: 'workflow1',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      },
      {
        ownerId: 111,
        repoId: 456,
        workflowId: 790,
        workflowName: 'workflow2',
        ownerType: USER_ACCOUNT_TYPE,
        ownerName: '',
        repoName: '',
        path: ''
      }
    ]
  )

  expect(calculated.github.accounts.get(111)?.visible).toEqual(true)
  expect(calculated.github.accounts.get(111)?.notify).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.size).toEqual(2)
  expect(calculated.github.accounts.get(111)?.repos.get(123)?.visible).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.get(123)?.notify).toEqual(true)
  expect(calculated.github.accounts.get(111)?.repos.get(456)?.visible).toEqual(false)
  expect(calculated.github.accounts.get(111)?.repos.get(456)?.notify).toEqual(false)
})
