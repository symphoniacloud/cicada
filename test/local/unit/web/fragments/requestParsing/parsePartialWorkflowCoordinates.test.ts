import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'
import { parsePartialWorkflowKeyFromQueryString } from '../../../../../../src/app/web/fragments/requestParsing/parseFragmentQueryStrings.js'

test('Fails if invalid account ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'BAD',
      repoId: 'GHRepo456'
    }
  })
  if (result.isSuccessResult) {
    throw new Error('Should have been failure')
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
})

test('Fails if invalid repo ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      repoId: 'BAD'
    }
  })
  if (result.isSuccessResult) {
    throw new Error('Should have been failure')
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
})

test('Fails if invalid workflow ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      workflowId: 'BAD'
    }
  })
  if (result.isSuccessResult) {
    throw new Error('Should have been failure')
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
})

test('Success if no IDs', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData()
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({})
  } else {
    throw new Error('Should have been a valid result')
  }
})

test('Success if only Account ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({ accountId: 'GHAccount123' })
  } else {
    throw new Error('Should have been a valid result')
  }
})

test('Success if only Repo ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      repoId: 'GHRepo123'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({ repoId: 'GHRepo123' })
  } else {
    throw new Error('Should have been a valid result')
  }
})

test('Success if only Workflow ID', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      workflowId: 'GHWorkflow123'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({ workflowId: 'GHWorkflow123' })
  } else {
    throw new Error('Should have been a valid result')
  }
})

test('Get all IDs', () => {
  const result = parsePartialWorkflowKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      workflowId: 'GHWorkflow123'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      workflowId: 'GHWorkflow123'
    })
  } else {
    throw new Error('Should have been a valid result')
  }
})
