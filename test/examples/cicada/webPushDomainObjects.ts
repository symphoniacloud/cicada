import { WebPushSubscription } from '../../../src/app/domain/types/WebPushSubscription'
import { fromRawGithubUserId } from '../../../src/app/domain/types/GithubUserId'

export const testTestUserPushSubscription: WebPushSubscription = {
  userId: fromRawGithubUserId(162360409),
  username: 'cicada-test-user',
  endpoint: 'https://web.push.apple.com/TestOne',
  keys: {
    p256dh: 'testkey1',
    auth: 'testauth1'
  }
}
export const testMikeRobertsPushSubscriptionTwo: WebPushSubscription = {
  userId: fromRawGithubUserId(49635),
  username: 'mikebroberts',
  endpoint: 'https://web.push.apple.com/TestTwo',
  keys: {
    p256dh: 'testkey2',
    auth: 'testauth2'
  }
}
export const testMikeRobertsPushSubscriptionThree: WebPushSubscription = {
  userId: fromRawGithubUserId(49635),
  username: 'mikebroberts',
  endpoint: 'https://web.push.apple.com/TestThree',
  keys: {
    p256dh: 'testkey3',
    auth: 'testauth3'
  }
}
