import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../../src/app/web/htmlResponses.js'
import { parseRepoKeyFromQueryString } from '../../../../../../src/app/web/fragments/requestParsing/parseFragmentQueryStrings.js'
import { changeLogLevelToError, changeLogLevelToWarn } from '../../../../../testSupport/logging.js'

test('Fails if no Account ID and Repo ID', () => {
  changeLogLevelToError()
  const result = parseRepoKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData()
  })
  if (result.isSuccessResult) {
    throw new Error('Should have been a valid result')
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
  changeLogLevelToWarn()
})

test('Get Account ID and Repo ID', () => {
  const result = parseRepoKeyFromQueryString({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      zzzz: 'asdas'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123',
      repoId: 'GHRepo456'
    })
  } else {
    throw new Error('Should have been a valid result')
  }
})
