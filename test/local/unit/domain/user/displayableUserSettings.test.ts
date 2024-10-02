import { expect, test } from 'vitest'
import { USER_ACCOUNT_TYPE } from '../../../../../src/app/domain/types/GithubAccountType'
import {
  toCalculatedAndDisplayableUserSettings,
  toDisplayableAccountSettings,
  toDisplayableRepoSettings,
  toDisplayableWorkflowSettings
} from '../../../../../src/app/domain/user/displayableUserSettings'
import { fromRawGithubAccountId } from '../../../../../src/app/domain/types/GithubAccountId'
import { fromRawGithubUserId } from '../../../../../src/app/domain/types/GithubUserId'
import { fromRawGithubRepoId } from '../../../../../src/app/domain/types/GithubRepoId'
import { fromRawGithubWorkflowId } from '../../../../../src/app/domain/types/GithubWorkflowId'

test('toDisplayableWorkflowSettings', () => {
  const displayable = toDisplayableWorkflowSettings(
    {
      accountId: fromRawGithubAccountId(123),
      repoId: fromRawGithubRepoId(456),
      workflowId: fromRawGithubWorkflowId(789)
    },
    {
      visible: true,
      notify: true
    },
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
    { accountId: fromRawGithubAccountId(123), repoId: fromRawGithubRepoId(456) },
    {
      visible: true,
      notify: true,
      workflows: {
        GHWorkflow789: {
          visible: true,
          notify: true
        }
      }
    },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        accountName: 'account1',
        repoName: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
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
      GHWorkflow789: {
        visible: true,
        notify: true,
        name: 'workflow1'
      }
    }
  })
})

test('toDisplayableAccountSettings', () => {
  const displayable = toDisplayableAccountSettings(
    fromRawGithubAccountId(123),
    {
      visible: true,
      notify: true,
      repos: {
        GHRepo456: {
          visible: true,
          notify: true,
          workflows: {
            GHWorkflow789: {
              visible: true,
              notify: true
            }
          }
        }
      }
    },
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        accountName: 'account1',
        repoName: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
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
      GHRepo456: {
        name: 'repo1',
        visible: true,
        notify: true,
        workflows: {
          GHWorkflow789: {
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
      userId: fromRawGithubUserId(111),
      github: {
        accounts: {
          GHAccount123: {
            repos: {
              GHRepo456: {
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
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        accountName: 'account1',
        repoName: 'repo1',
        accountType: USER_ACCOUNT_TYPE
      }
    ],
    [
      {
        accountId: fromRawGithubAccountId(123),
        repoId: fromRawGithubRepoId(456),
        workflowId: fromRawGithubWorkflowId(789),
        workflowName: 'workflow1',
        accountType: USER_ACCOUNT_TYPE,
        accountName: 'account1',
        repoName: 'repo1',
        path: ''
      }
    ]
  )

  expect(displayable).toEqual({
    userId: fromRawGithubUserId(111),
    github: {
      accounts: {
        GHAccount123: {
          name: 'account1',
          visible: true,
          notify: true,
          repos: {
            GHRepo456: {
              name: 'repo1',
              visible: true,
              notify: false,
              workflows: {
                GHWorkflow789: {
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
