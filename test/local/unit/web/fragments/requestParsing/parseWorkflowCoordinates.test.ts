import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'
import { withSuppressedWarningLogs } from '../../../../../testSupport/logging.js'

import { parseWorkflowKeyFromQueryString } from '../../../../../../src/app/web/fragments/requestParsing/parseFragmentQueryStrings.js'

test('Fails if no IDs', () => {
  withSuppressedWarningLogs(() => {
    const result = parseWorkflowKeyFromQueryString({
      ...createStubApiGatewayProxyEvent(),
      username: '',
      refData: buildUserScopedRefData()
    })
    if (result.isSuccessResult) {
      throw new Error('Should have been a valid result')
    } else {
      expect(result.failureResult).toEqual(invalidRequestResponse)
    }
  })
})

test('Get Account ID and Repo ID', () => {
  const result = parseWorkflowKeyFromQueryString({
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
