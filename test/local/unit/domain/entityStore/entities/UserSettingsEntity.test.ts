import { expect, test } from 'vitest'
import { parseUserSettings } from '../../../../../../src/app/domain/entityStore/entities/UserSettingsEntity'

test('parser test', () => {
  const testValue = {
    userId: 111,
    github: {
      accounts: {
        '123': {
          repos: {
            '456': {
              workflows: {
                '789': {
                  visible: true
                }
              }
            }
          }
        }
      }
    }
  }

  const parsed = parseUserSettings(testValue)
  expect(parsed.github.accounts.get(123)?.repos.get(456)?.workflows.get(789)?.visible).toEqual(true)
})
