import { expect, test } from 'vitest'
import {
  GitHubAppIdSchema,
  GitHubInstallationIdSchema
} from '../../../../../src/app/ioTypes/GitHubSchemas.js'

test('isGithubAppId', () => {
  expect(GitHubAppIdSchema.safeParse('GHApp123').success).toBeTruthy()

  expect(GitHubAppIdSchema.safeParse(undefined).success).toBeFalsy()
  expect(GitHubAppIdSchema.safeParse(123).success).toBeFalsy()
  expect(GitHubAppIdSchema.safeParse('123').success).toBeFalsy()
  expect(GitHubAppIdSchema.safeParse('GHApp').success).toBeFalsy()
  expect(GitHubAppIdSchema.safeParse('GHAppfoo').success).toBeFalsy()
})

test('isGithubInstallationId', () => {
  expect(GitHubInstallationIdSchema.safeParse('GHInstallation123').success).toBeTruthy()

  expect(GitHubInstallationIdSchema.safeParse(undefined).success).toBeFalsy()
  expect(GitHubInstallationIdSchema.safeParse(123).success).toBeFalsy()
  expect(GitHubInstallationIdSchema.safeParse('123').success).toBeFalsy()
  expect(GitHubInstallationIdSchema.safeParse('GHInstallation').success).toBeFalsy()
  expect(GitHubInstallationIdSchema.safeParse('GHInstallationfoo').success).toBeFalsy()
})
