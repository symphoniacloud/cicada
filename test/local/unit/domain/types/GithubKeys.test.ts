import { expect, test } from 'vitest'
import { isGithubAppId } from '../../../../../src/app/domain/types/GithubAppId.js'
import { isGithubInstallationId } from '../../../../../src/app/domain/types/GithubInstallationId.js'

test('isGithubAppId', () => {
  expect(isGithubAppId('GHApp123')).toBeTruthy()

  expect(isGithubAppId(undefined)).toBeFalsy()
  expect(isGithubAppId(123)).toBeFalsy()
  expect(isGithubAppId('123')).toBeFalsy()
  expect(isGithubAppId('GHApp')).toBeFalsy()
  expect(isGithubAppId('GHAppfoo')).toBeFalsy()
})

test('isGithubInstallationId', () => {
  expect(isGithubInstallationId('GHInstallation123')).toBeTruthy()

  expect(isGithubInstallationId(undefined)).toBeFalsy()
  expect(isGithubInstallationId(123)).toBeFalsy()
  expect(isGithubInstallationId('123')).toBeFalsy()
  expect(isGithubInstallationId('GHInstallation')).toBeFalsy()
  expect(isGithubInstallationId('GHInstallationfoo')).toBeFalsy()
})
