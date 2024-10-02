import { expect, test } from 'vitest'
import {
  githubWorkflowAthenaSchema,
  githubWorkflowGlueSchema,
  topLevelGlueFields
} from '../../../../../../../src/cdk/stacks/main/reporting/schema'

test('glue schema', () => {
  expect(githubWorkflowGlueSchema).toEqual([
    { name: 'account_id', type: 'string' },
    { name: 'account_name', type: 'string' },
    { name: 'account_type', type: 'string' },
    { name: 'repo_id', type: 'string' },
    { name: 'repo_name', type: 'string' },
    { name: 'repo_html_url', type: 'string' },
    { name: 'workflow_id', type: 'string' },
    { name: 'workflow_name', type: 'string' },
    { name: 'path', type: 'string' },
    { name: 'workflow_html_url', type: 'string' },
    { name: 'workflow_badge_url', type: 'string' },
    { name: 'workflow_run_id', type: 'string' },
    { name: 'run_number', type: 'bigint' },
    { name: 'run_attempt', type: 'bigint' },
    { name: 'display_title', type: 'string' },
    { name: 'event', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'head_branch', type: 'string' },
    { name: 'head_sha', type: 'string' },
    { name: 'conclusion', type: 'string' },
    { name: 'created_at', type: 'string' },
    { name: 'updated_at', type: 'string' },
    { name: 'run_started_at', type: 'string' },
    { name: 'html_url', type: 'string' },
    {
      name: 'actor',
      type: 'struct<user_id:string,user_name:string,avatar_url:string,html_url:string>'
    }
  ])
})

test('athena schema', () => {
  expect(githubWorkflowAthenaSchema).toEqual(`account_id string,
    account_name string,
    account_type string,
    repo_id string,
    repo_name string,
    repo_html_url string,
    workflow_id string,
    workflow_name string,
    path string,
    workflow_html_url string,
    workflow_badge_url string,
    workflow_run_id string,
    run_number bigint,
    run_attempt bigint,
    display_title string,
    event string,
    status string,
    head_branch string,
    head_sha string,
    conclusion string,
    created_at string,
    updated_at string,
    run_started_at string,
    html_url string,
    actor struct<user_id:string,user_name:string,avatar_url:string,html_url:string>`)
})

test('top level fields', () => {
  expect(topLevelGlueFields).toEqual([
    'account_id',
    'account_name',
    'account_type',
    'repo_id',
    'repo_name',
    'repo_html_url',
    'workflow_id',
    'workflow_name',
    'path',
    'workflow_html_url',
    'workflow_badge_url',
    'workflow_run_id',
    'run_number',
    'run_attempt',
    'display_title',
    'event',
    'status',
    'head_branch',
    'head_sha',
    'conclusion',
    'created_at',
    'updated_at',
    'run_started_at',
    'html_url',
    'actor'
  ])
})
