import { expect, test } from 'vitest'
import { isGitHubAppId, isGitHubInstallationId } from '../../../../../src/app/types/GitHubTypeChecks.js'

test('isGithubAppId', () => {
  expect(isGitHubAppId('GHApp123')).toBeTruthy()

  expect(isGitHubAppId(undefined)).toBeFalsy()
  expect(isGitHubAppId(123)).toBeFalsy()
  expect(isGitHubAppId('123')).toBeFalsy()
  expect(isGitHubAppId('GHApp')).toBeFalsy()
  expect(isGitHubAppId('GHAppfoo')).toBeFalsy()
})

test('isGithubInstallationId', () => {
  expect(isGitHubInstallationId('GHInstallation123')).toBeTruthy()

  expect(isGitHubInstallationId(undefined)).toBeFalsy()
  expect(isGitHubInstallationId(123)).toBeFalsy()
  expect(isGitHubInstallationId('123')).toBeFalsy()
  expect(isGitHubInstallationId('GHInstallation')).toBeFalsy()
  expect(isGitHubInstallationId('GHInstallationfoo')).toBeFalsy()
})
