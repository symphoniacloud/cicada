import { expect, test } from 'vitest'
import {
  calculateRepoSettings,
  calculateWorkflowSettings
} from '../../../../../src/app/domain/user/calculatedUserSettings'
import { USER_ACCOUNT_TYPE } from '../../../../../src/app/domain/types/GithubAccountType'
import { GithubWorkflowId } from '../../../../../src/app/domain/types/GithubKeys'
import { PersistedGithubWorkflowSettings } from '../../../../../src/app/domain/types/UserSettings'

test('workflow settings', () => {
  expect(calculateWorkflowSettings(undefined)).toEqual({
    visible: true,
    notify: true
  })
  expect(calculateWorkflowSettings({ visible: true })).toEqual({
    visible: true,
    notify: true
  })
  expect(calculateWorkflowSettings({ visible: false })).toEqual({
    visible: false,
    notify: false
  })
  expect(calculateWorkflowSettings({ visible: false, notify: false })).toEqual({
    visible: false,
    notify: false
  })
  expect(calculateWorkflowSettings({ notify: false })).toEqual({
    visible: true,
    notify: false
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
    ]
  )
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.workflows.size).toEqual(1)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: true })
})

test('repo settings when workflow settings', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: false })
  const calculated = calculateRepoSettings({ workflows }, { ownerId: 123, repoId: 456 }, [
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
  ])
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(true)
  expect(calculated.workflows.size).toEqual(1)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: false })
})

test('repo settings when visible false', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: false })
  const calculated = calculateRepoSettings({ workflows, visible: false }, { ownerId: 123, repoId: 456 }, [
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
  ])
  expect(calculated.visible).toEqual(false)
  expect(calculated.notify).toEqual(false)
  expect(calculated.workflows.size).toEqual(0)
})

test('repo settings when visible true notify false', () => {
  const workflows = new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  workflows.set(789, { notify: true })
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
      }
    ]
  )
  expect(calculated.visible).toEqual(true)
  expect(calculated.notify).toEqual(false)
  expect(calculated.workflows.size).toEqual(1)
  expect(calculated.workflows.get(789)).toEqual({ visible: true, notify: false })
})
