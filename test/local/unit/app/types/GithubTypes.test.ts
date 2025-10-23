import { expect, test } from 'vitest'
import { isGitHubAccountCoordinates } from '../../../../../src/app/types/GitHubAccountCoordinates.js'
import { isGitHubAccountId } from '../../../../../src/app/types/GitHubAccountId.js'

test('GitHub Account Id type', () => {
  expect(isGitHubAccountId('GHAccount123')).toBeTruthy()
  expect(isGitHubAccountId('123')).toBeFalsy()
  expect(isGitHubAccountId({ accountId: '123' })).toBeFalsy()
})

test('GitHub Account Coordinates type', () => {
  expect(isGitHubAccountCoordinates({ accountId: 'GHAccount123' })).toBeTruthy()
  expect(isGitHubAccountCoordinates({ accountId: '123' })).toBeFalsy()
})
