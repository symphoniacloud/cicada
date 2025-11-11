import { expect, test } from 'vitest'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId,
  fromRawGithubWorkflowRunId,
  toRawGithubAppId,
  toRawGithubInstallationId
} from '../../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'

test('toFromIds', () => {
  expect(fromRawGithubAppId(123)).toEqual('GHApp123')
  expect(toRawGithubAppId('GHApp123')).toEqual(123)
  expect(fromRawGithubInstallationId(123)).toEqual('GHInstallation123')
  expect(toRawGithubInstallationId('GHInstallation123')).toEqual(123)
  expect(fromRawGitHubAccountId(123)).toEqual('GHAccount123')
  expect(fromRawGithubUserId(123)).toEqual('GHUser123')
  expect(fromRawGitHubRepoId(123)).toEqual('GHRepo123')
  expect(fromRawGitHubWorkflowId(123)).toEqual('GHWorkflow123')
  expect(fromRawGithubWorkflowRunId(123)).toEqual('GHWorkflowRun123')
})
