import { expect, test } from 'vitest'
import {
  accountUpdater,
  repoUpdater,
  workflowUpdater
} from '../../../../../src/app/domain/user/persistedUserSettings'
import {
  GithubAccountId,
  GithubRepoId,
  GithubUserId,
  GithubWorkflowId
} from '../../../../../src/app/domain/types/GithubKeys'
import {
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedGithubWorkflowSettings,
  PersistedUserSettings
} from '../../../../../src/app/domain/types/UserSettings'

function emptySettings(userId: GithubUserId): PersistedUserSettings {
  return {
    userId,
    github: {
      accounts: new Map<GithubAccountId, PersistedGithubAccountSettings>()
    }
  }
}

test('update settings new account', () => {
  const newSettings = accountUpdater(123, 'visible', true)(emptySettings(11))

  expect(newSettings.github.accounts.get(123)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.visible).toEqual(true)
})

test('update settings existing account', () => {
  const settings = emptySettings(11)
  const accountSettings: PersistedGithubAccountSettings = {
    notify: true,
    repos: new Map<GithubRepoId, PersistedGithubRepoSettings>()
  }
  settings.github.accounts.set(123, accountSettings)

  const newSettings = accountUpdater(123, 'visible', true)(settings)
  expect(newSettings.github.accounts.get(123)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.visible).toEqual(true)
})

test('update settings new repo', () => {
  const newSettings = repoUpdater({ ownerId: 123, repoId: 456 }, 'visible', true)(emptySettings(11))

  expect(newSettings.github.accounts.get(123)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.visible).toEqual(true)
})

test('update settings existing repo', () => {
  const repos = new Map<GithubRepoId, PersistedGithubRepoSettings>()
  repos.set(456, {
    notify: true,
    workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  })
  const accountSettings: PersistedGithubAccountSettings = {
    notify: true,
    repos
  }
  const settings = emptySettings(11)
  settings.github.accounts.set(123, accountSettings)

  const newSettings = repoUpdater({ ownerId: 123, repoId: 456 }, 'visible', true)(settings)
  expect(newSettings.github.accounts.get(123)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.visible).toEqual(true)
})

test('update settings new workflow', () => {
  const newSettings = workflowUpdater(
    { ownerId: 123, repoId: 456, workflowId: 789 },
    'visible',
    true
  )(emptySettings(11))

  expect(newSettings.github.accounts.get(123)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.workflows.get(789)?.notify).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.workflows.get(789)?.visible).toEqual(true)
})

test('update settings existing repo', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, {
    notify: true
  })
  const repos = new Map<GithubRepoId, PersistedGithubRepoSettings>()
  repos.set(456, {
    notify: true,
    workflows: workflows
  })
  const accountSettings: PersistedGithubAccountSettings = {
    notify: true,
    repos
  }
  const settings = emptySettings(11)
  settings.github.accounts.set(123, accountSettings)

  const newSettings = workflowUpdater(
    { ownerId: 123, repoId: 456, workflowId: 789 },
    'visible',
    true
  )(settings)
  expect(newSettings.github.accounts.get(123)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.visible).toBeUndefined()
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.workflows.get(789)?.notify).toEqual(true)
  expect(newSettings.github.accounts.get(123)?.repos.get(456)?.workflows.get(789)?.visible).toEqual(true)
})
