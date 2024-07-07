import { expect, test } from 'vitest'
import { workflowRow } from '../../../../../src/app/web/domainComponents/workflowComponents'
import { testPersonalTestRepoWorkflowRun } from '../../../../examples/cicada/githubDomainObjects'
import { defaultFakeClock } from '../../../../testSupport/fakes/fakeClock'
import { a, td, tr } from '../../../../../src/app/web/hiccough/hiccoughElements'
import { githubAnchor } from '../../../../../src/app/web/domainComponents/genericComponents'

test('successful row, all Repos', () => {
  expect(workflowRow(defaultFakeClock, testPersonalTestRepoWorkflowRun, 'allRepos')).toEqual(
    tr(
      { class: 'success' },
      td(
        a(`/repo?ownerId=162360409&repoId=767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/workflow?ownerId=162360409&repoId=767679529&workflowId=88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('Success'),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('16 seconds'),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('successful run, repo activity', () => {
  expect(workflowRow(defaultFakeClock, testPersonalTestRepoWorkflowRun, 'repoActivity')).toEqual(
    tr(
      { class: 'success' },
      td('Successful Run'),
      td(
        a(`/workflow?ownerId=162360409&repoId=767679529&workflowId=88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('unsuccessful run, all Repos', () => {
  expect(
    workflowRow(defaultFakeClock, { ...testPersonalTestRepoWorkflowRun, conclusion: 'failure' }, 'allRepos')
  ).toEqual(
    tr(
      { class: 'danger' },
      td(
        a(`/repo?ownerId=162360409&repoId=767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/workflow?ownerId=162360409&repoId=767679529&workflowId=88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('Failure'),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('16 seconds'),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('failed run, repo Activity', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      { ...testPersonalTestRepoWorkflowRun, conclusion: 'failure' },
      'repoActivity'
    )
  ).toEqual(
    tr(
      { class: 'danger' },
      td('Failed Run'),
      td(
        a(`/workflow?ownerId=162360409&repoId=767679529&workflowId=88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('in progress run, all repos', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      {
        ...testPersonalTestRepoWorkflowRun,
        conclusion: undefined,
        status: 'in_progress'
      },
      'allRepos'
    )
  ).toEqual(
    tr(
      { class: 'warning' },
      td(
        a(`/repo?ownerId=162360409&repoId=767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/workflow?ownerId=162360409&repoId=767679529&workflowId=88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('In Progress'),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('16 seconds'),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('queued run, workflow activity', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      {
        ...testPersonalTestRepoWorkflowRun,
        conclusion: undefined,
        status: 'queued'
      },
      'workflowActivity'
    )
  ).toEqual(
    tr(
      { class: 'warning' },
      td('In Progress (queued)'),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('16 seconds'),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})

test('in progress run, workflow activity', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      {
        ...testPersonalTestRepoWorkflowRun,
        conclusion: undefined,
        status: 'in_progress'
      },
      'workflowActivity'
    )
  ).toEqual(
    tr(
      { class: 'warning' },
      td('In Progress'),
      td(
        '2024-03-05T18:01:40Z',
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530')
      ),
      td('16 seconds'),
      td('cicada-test-user', `&nbsp;`, githubAnchor(`https://github.com/cicada-test-user`)),
      td(
        'Test Workflow',
        '&nbsp;',
        githubAnchor(
          'https://github.com/cicada-test-user/personal-test-repo/commit/dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
        )
      )
    )
  )
})
