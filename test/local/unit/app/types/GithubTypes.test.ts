import { expect, test } from 'vitest'

import { isGitHubAccountKey } from '../../../../../src/app/ioTypes/GitHubTypeChecks.js'
import { GitHubAccountIdSchema } from '../../../../../src/app/ioTypes/GitHubSchemas.js'

test('GitHub Account Id type', () => {
  expect(GitHubAccountIdSchema.safeParse('GHAccount123').success).toBeTruthy()
  expect(GitHubAccountIdSchema.safeParse('123').success).toBeFalsy()
  expect(GitHubAccountIdSchema.safeParse({ accountId: '123' }).success).toBeFalsy()
})

test('GitHub Account Coordinates type', () => {
  expect(isGitHubAccountKey({ accountId: 'GHAccount123' })).toBeTruthy()
  expect(isGitHubAccountKey({ accountId: '123' })).toBeFalsy()
})
