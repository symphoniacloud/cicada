import { expect, test } from 'vitest'
import { parseAccountKeyFromQueryString } from '../../../../../../src/app/web/fragments/requestParsing/parseFragmentQueryStrings.js'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'

test('Fails if no Account ID', () => {
  const result = parseAccountKeyFromQueryString({
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

test('Get Account ID', () => {
  const result = parseAccountKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123'
    })
  } else {
    throw new Error('Should have been a valid result')
  }
})

test('Get Account ID removes superfluous fields', () => {
  const result = parseAccountKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      unused: 'XYZ'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123'
    })
  } else {
    throw new Error('Should have been a valid result')
  }
})
