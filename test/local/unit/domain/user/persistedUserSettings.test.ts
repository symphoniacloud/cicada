import { expect, test } from 'vitest'
import {
  accountUpdater,
  repoUpdater,
  workflowUpdater
} from '../../../../../src/app/domain/user/persistedUserSettings'
import { PersistedUserSettings } from '../../../../../src/app/domain/types/UserSettings'
import { fromRawGithubAccountId } from '../../../../../src/app/domain/types/GithubAccountId'
import { fromRawGithubUserId } from '../../../../../src/app/domain/types/GithubUserId'
import { fromRawGithubRepoId } from '../../../../../src/app/domain/types/GithubRepoId'
import { fromRawGithubWorkflowId } from '../../../../../src/app/domain/types/GithubWorkflowId'

function emptySettings(rawUserId: number): PersistedUserSettings {
  return {
    userId: fromRawGithubUserId(rawUserId),
    github: {
      accounts: {}
    }
  }
}

test('update settings new account', () => {
  const newSettings = accountUpdater(fromRawGithubAccountId(123), 'visible', true)(emptySettings(11))
  expect(newSettings.github.accounts).toEqual({
    GHAccount123: {
      visible: true,
      repos: {}
    }
  })
})

test('update settings existing account', () => {
  const settings = emptySettings(11)
  settings.github.accounts['GHAccount123'] = {
    notify: true,
    repos: {}
  }

  const newSettings = accountUpdater(fromRawGithubAccountId(123), 'visible', true)(settings)
  expect(newSettings.github.accounts).toEqual({
    GHAccount123: {
      notify: true,
      visible: true,
      repos: {}
    }
  })
})

test('update settings new repo', () => {
  const newSettings = repoUpdater(
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    'visible',
    true
  )(emptySettings(11))
  expect(newSettings.github.accounts['GHAccount123']).toEqual({
    repos: {
      GHRepo456: {
        visible: true,
        workflows: {}
      }
    }
  })
})

test('update settings existing repo', () => {
  const settings = emptySettings(11)
  settings.github.accounts['GHAccount123'] = {
    notify: true,
    repos: {
      GHRepo456: {
        notify: true,
        workflows: {}
      }
    }
  }

  const newSettings = repoUpdater(
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    'visible',
    true
  )(settings)
  expect(newSettings.github.accounts['GHAccount123']).toEqual({
    notify: true,
    repos: { GHRepo456: { notify: true, visible: true, workflows: {} } }
  })
})

test('update settings new workflow', () => {
  const newSettings = workflowUpdater(
    {
      accountId: fromRawGithubAccountId(123),
      repoId: fromRawGithubRepoId(456),
      workflowId: fromRawGithubWorkflowId(789)
    },
    'visible',
    true
  )(emptySettings(11))

  expect(newSettings.github.accounts).toEqual({
    GHAccount123: {
      repos: {
        GHRepo456: {
          workflows: {
            GHWorkflow789: {
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
  settings.github.accounts['GHAccount123'] = {
    notify: true,
    repos: {
      GHRepo456: {
        notify: true,
        workflows: {
          GHWorkflow789: {
            notify: true
          }
        }
      }
    }
  }

  const newSettings = workflowUpdater(
    {
      accountId: fromRawGithubAccountId(123),
      repoId: fromRawGithubRepoId(456),
      workflowId: fromRawGithubWorkflowId(789)
    },
    'visible',
    true
  )(settings)

  expect(newSettings.github.accounts).toEqual({
    GHAccount123: {
      notify: true,
      repos: {
        GHRepo456: {
          notify: true,
          workflows: {
            GHWorkflow789: {
              notify: true,
              visible: true
            }
          }
        }
      }
    }
  })
})
