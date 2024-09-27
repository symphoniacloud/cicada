import { expect, test } from 'vitest'
import {
  accountUpdater,
  repoUpdater,
  workflowUpdater
} from '../../../../../src/app/domain/user/persistedUserSettings'
import { GithubUserId } from '../../../../../src/app/domain/types/GithubKeys'
import { PersistedUserSettings } from '../../../../../src/app/domain/types/UserSettings'

function emptySettings(userId: GithubUserId): PersistedUserSettings {
  return {
    userId,
    github: {
      accounts: {}
    }
  }
}

test('update settings new account', () => {
  const newSettings = accountUpdater(123, 'visible', true)(emptySettings(11))
  expect(newSettings.github.accounts).toEqual({
    123: {
      visible: true,
      repos: {}
    }
  })
})

test('update settings existing account', () => {
  const settings = emptySettings(11)
  settings.github.accounts[123] = {
    notify: true,
    repos: {}
  }

  const newSettings = accountUpdater(123, 'visible', true)(settings)
  expect(newSettings.github.accounts).toEqual({
    123: {
      notify: true,
      visible: true,
      repos: {}
    }
  })
})

test('update settings new repo', () => {
  const newSettings = repoUpdater({ accountId: 123, repoId: 456 }, 'visible', true)(emptySettings(11))
  expect(newSettings.github.accounts[123]).toEqual({
    repos: {
      456: {
        visible: true,
        workflows: {}
      }
    }
  })
})

test('update settings existing repo', () => {
  const settings = emptySettings(11)
  settings.github.accounts[123] = {
    notify: true,
    repos: {
      456: {
        notify: true,
        workflows: {}
      }
    }
  }

  const newSettings = repoUpdater({ accountId: 123, repoId: 456 }, 'visible', true)(settings)
  expect(newSettings.github.accounts[123]).toEqual({
    notify: true,
    repos: { 456: { notify: true, visible: true, workflows: {} } }
  })
})

test('update settings new workflow', () => {
  const newSettings = workflowUpdater(
    { accountId: 123, repoId: 456, workflowId: 789 },
    'visible',
    true
  )(emptySettings(11))

  expect(newSettings.github.accounts).toEqual({
    123: {
      repos: {
        456: {
          workflows: {
            789: {
              visible: true
            }
          }
        }
      }
    }
  })
})

test('update settings existing repo', () => {
  const settings = emptySettings(11)
  settings.github.accounts[123] = {
    notify: true,
    repos: {
      456: {
        notify: true,
        workflows: {
          789: {
            notify: true
          }
        }
      }
    }
  }

  const newSettings = workflowUpdater(
    { accountId: 123, repoId: 456, workflowId: 789 },
    'visible',
    true
  )(settings)

  expect(newSettings.github.accounts).toEqual({
    123: {
      notify: true,
      repos: {
        456: {
          notify: true,
          workflows: {
            789: {
              notify: true,
              visible: true
            }
          }
        }
      }
    }
  })
})
