import { expect, test } from 'vitest'
import { workflowRow } from '../../../../../src/app/web/domainComponents/workflowComponents'
import { testPersonalTestRepoWorkflowRun } from '../../../../examples/cicada/githubDomainObjects'
import { defaultFakeClock } from '../../../../testSupport/fakes/fakeClock'
import { a, td, tr } from '../../../../../src/app/web/hiccough/hiccoughElements'
import { githubAnchor } from '../../../../../src/app/web/domainComponents/genericComponents'

test('successful row, no description', () => {
  expect(
    workflowRow(defaultFakeClock, testPersonalTestRepoWorkflowRun, { showRepo: true, showWorkflow: true })
  ).toEqual(
    tr(
      { class: 'success' },
      undefined,
      td(
        a(`/app/account/162360409/repo/767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/app/account/162360409/repo/767679529/workflow/88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('Success'),
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

test('successful run with description', () => {
  expect(workflowRow(defaultFakeClock, testPersonalTestRepoWorkflowRun, { showDescription: true })).toEqual(
    tr(
      { class: 'success' },
      td('Successful Run'),
      undefined,
      undefined,
      undefined,
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

test('unsuccessful run, no description', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      { ...testPersonalTestRepoWorkflowRun, conclusion: 'failure' },
      { showRepo: true, showWorkflow: true }
    )
  ).toEqual(
    tr(
      { class: 'danger' },
      undefined,
      td(
        a(`/app/account/162360409/repo/767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/app/account/162360409/repo/767679529/workflow/88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('Failure'),
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

test('failed run with description', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      { ...testPersonalTestRepoWorkflowRun, conclusion: 'failure' },
      { showDescription: true }
    )
  ).toEqual(
    tr(
      { class: 'danger' },
      td('Failed Run'),
      undefined,
      undefined,
      undefined,
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

test('in progress run, no description', () => {
  expect(
    workflowRow(
      defaultFakeClock,
      {
        ...testPersonalTestRepoWorkflowRun,
        conclusion: undefined,
        status: 'in_progress'
      },
      { showRepo: true, showWorkflow: true }
    )
  ).toEqual(
    tr(
      { class: 'warning' },
      undefined,
      td(
        a(`/app/account/162360409/repo/767679529`, 'personal-test-repo'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo')
      ),
      td(
        a(`/app/account/162360409/repo/767679529/workflow/88508779`, 'Test Workflow'),
        '&nbsp;',
        githubAnchor('https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml')
      ),
      td('In Progress'),
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
