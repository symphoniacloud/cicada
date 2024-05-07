import { expect, test } from 'vitest'
import { generateRunEventNotification } from '../../../../../src/app/domain/webPush/cicadaEventWebPushPublisher'
import { testPersonalTestRepoWorkflowRun } from '../../../../examples/cicada/githubDomainObjects'

test('notification message', () => {
  expect(
    generateRunEventNotification({
      ...testPersonalTestRepoWorkflowRun,
      conclusion: undefined,
      status: 'in_progress'
    })
  ).toEqual({
    title: '⏳ Test Workflow',
    body: 'Workflow Test Workflow in Repo personal-test-repo in progress',
    data: {
      url: 'https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530'
    }
  })
  expect(generateRunEventNotification(testPersonalTestRepoWorkflowRun)).toEqual({
    title: '✅ Test Workflow',
    body: 'Workflow Test Workflow in Repo personal-test-repo succeeded',
    data: {
      url: 'https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530'
    }
  })
  expect(generateRunEventNotification({ ...testPersonalTestRepoWorkflowRun, conclusion: 'failure' })).toEqual(
    {
      title: '❌ Test Workflow',
      body: 'Workflow Test Workflow in Repo personal-test-repo failed',
      data: {
        url: 'https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530'
      }
    }
  )
})
