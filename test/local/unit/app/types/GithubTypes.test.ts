import { expect, test } from 'vitest'
import {
  GitHubAccountIdSchema,
  GitHubAccountKeySchema
} from '../../../../../src/app/ioTypes/GitHubSchemas.js'

test('GitHub Account Id type', () => {
  expect(GitHubAccountIdSchema.safeParse('GHAccount123').success).toBeTruthy()
  expect(GitHubAccountIdSchema.safeParse('123').success).toBeFalsy()
  expect(GitHubAccountIdSchema.safeParse({ accountId: '123' }).success).toBeFalsy()
})

test('GitHub Account Coordinates type', () => {
  expect(GitHubAccountKeySchema.safeParse({ accountId: 'GHAccount123' }).success).toBeTruthy()
  expect(GitHubAccountKeySchema.safeParse({ accountId: '123' }).success).toBeFalsy()
})
