import { expect, test } from 'vitest'
import { parseAccountCoordinates } from '../../../../../../src/app/web/fragments/requestParsing/parseAccountCoordinates.js'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'

test('Fails if no Account ID', () => {
  const result = parseAccountCoordinates({
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
  const result = parseAccountCoordinates({
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
  const result = parseAccountCoordinates({
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
