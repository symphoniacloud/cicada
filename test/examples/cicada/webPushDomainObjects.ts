import { WebPushSubscription } from '../../../src/app/domain/types/WebPushSubscription.js'
import { fromRawGithubUserId } from '../../../src/app/domain/types/GithubUserId.js'

export const testTestUserPushSubscription: WebPushSubscription = {
  userId: fromRawGithubUserId(162360409),
  userName: 'cicada-test-user',
  endpoint: 'https://web.push.apple.com/TestOne',
  keys: {
    p256dh: 'testkey1',
    auth: 'testauth1'
  }
}
export const testMikeRobertsPushSubscriptionTwo: WebPushSubscription = {
  userId: fromRawGithubUserId(49635),
  userName: 'mikebroberts',
  endpoint: 'https://web.push.apple.com/TestTwo',
  keys: {
    p256dh: 'testkey2',
    auth: 'testauth2'
  }
}
export const testMikeRobertsPushSubscriptionThree: WebPushSubscription = {
  userId: fromRawGithubUserId(49635),
  userName: 'mikebroberts',
  endpoint: 'https://web.push.apple.com/TestThree',
  keys: {
    p256dh: 'testkey3',
    auth: 'testauth3'
  }
}
