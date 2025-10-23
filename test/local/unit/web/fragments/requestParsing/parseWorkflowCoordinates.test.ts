import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'
import { parseWorkflowCoordinates } from '../../../../../../src/app/web/fragments/requestParsing/parseWorkflowCoordinates.js'

test('Fails if no IDs', () => {
  const result = parseWorkflowCoordinates({
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

test('Get Account ID and Repo ID', () => {
  const result = parseWorkflowCoordinates({
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
