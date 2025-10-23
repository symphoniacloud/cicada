import { expect, test } from 'vitest'
import { isGitHubAccountKey } from '../../../../../src/app/types/GitHubKeyTypes.js'

import { isGitHubAccountId } from '../../../../../src/app/types/GitHubIdTypes.js'

test('GitHub Account Id type', () => {
  expect(isGitHubAccountId('GHAccount123')).toBeTruthy()
  expect(isGitHubAccountId('123')).toBeFalsy()
  expect(isGitHubAccountId({ accountId: '123' })).toBeFalsy()
})

test('GitHub Account Coordinates type', () => {
  expect(isGitHubAccountKey({ accountId: 'GHAccount123' })).toBeTruthy()
  expect(isGitHubAccountKey({ accountId: '123' })).toBeFalsy()
})
