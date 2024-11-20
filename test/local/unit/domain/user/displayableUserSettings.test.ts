import { expect, test } from 'vitest'
import {
  toCalculatedAndDisplayableUserSettings,
  toDisplayableAccountSettings,
  toDisplayableRepoSettings,
  toDisplayableWorkflowSettings
} from '../../../../../src/app/domain/user/displayableUserSettings'
import { fromRawGithubUserId } from '../../../../../src/app/domain/types/GithubUserId'
import {
  buildAccountStructure,
  buildUserScopedRefData,
  buildRepoStructure,
  buildWorkflowSummary
} from '../../../../testSupport/builders/accountStructureBuilders'

test('toDisplayableWorkflowSettings', () => {
  const workflow = buildWorkflowSummary({ workflowName: 'workflow1' })

  const displayable = toDisplayableWorkflowSettings(
    {
      visible: true,
      notify: true
    },
    workflow
  )

  expect(displayable).toEqual({
    visible: true,
    notify: true,
    name: 'workflow1'
  })
})

test('toDisplayableRepoSettings', () => {
  const repo = buildRepoStructure({
    repoName: 'repo1',
    workflows: [buildWorkflowSummary({ workflowName: 'workflow1' })]
  })

  const displayable = toDisplayableRepoSettings(
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
    repo
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
  const account = buildAccountStructure({
    accountName: 'account1',
    repos: [
      buildRepoStructure({
        repoName: 'repo1',
        workflows: [buildWorkflowSummary({ workflowName: 'workflow1' })]
      })
    ]
  })

  const displayable = toDisplayableAccountSettings(
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
    account
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
  const accountStructure = buildUserScopedRefData({
    accountName: 'account1',
    repos: [
      buildRepoStructure({
        repoName: 'repo1',
        workflows: [buildWorkflowSummary({ workflowName: 'workflow1' })]
      })
    ]
  })

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
    accountStructure
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

// TODO - need test where there is less in calculated settings than in ref data, etc.
