import { expect, test } from 'vitest'
import { isGithubInstallationId } from '../../../../../src/app/domain/types/GithubInstallationId.js'
import { isGitHubAppId } from '../../../../../src/app/types/GitHubIdTypes.js'

test('isGithubAppId', () => {
  expect(isGitHubAppId('GHApp123')).toBeTruthy()

  expect(isGitHubAppId(undefined)).toBeFalsy()
  expect(isGitHubAppId(123)).toBeFalsy()
  expect(isGitHubAppId('123')).toBeFalsy()
  expect(isGitHubAppId('GHApp')).toBeFalsy()
  expect(isGitHubAppId('GHAppfoo')).toBeFalsy()
})

test('isGithubInstallationId', () => {
  expect(isGithubInstallationId('GHInstallation123')).toBeTruthy()

  expect(isGithubInstallationId(undefined)).toBeFalsy()
  expect(isGithubInstallationId(123)).toBeFalsy()
  expect(isGithubInstallationId('123')).toBeFalsy()
  expect(isGithubInstallationId('GHInstallation')).toBeFalsy()
  expect(isGithubInstallationId('GHInstallationfoo')).toBeFalsy()
})
