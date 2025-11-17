import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../testSupport/fakes/awsStubs.js'
import { buildUserScopedRefData } from '../../../../testSupport/builders/accountStructureBuilders.js'
import { invalidRequestResponse } from '../../../../../src/app/web/htmlResponses.js'
import { parsePostUserSettingParameters } from '../../../../../src/app/web/fragments/postUserSetting.js'
import { withSuppressedWarningLogs } from '../../../../testSupport/logging.js'

test('Successful minimal parse', () => {
  const result = parsePostUserSettingParameters({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      setting: 'visible',
      enabled: 'true'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123',
      setting: 'visible',
      enabled: true
    })
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
})

test('Successful full parse', () => {
  const result = parsePostUserSettingParameters({
    ...createStubApiGatewayProxyEvent(),
    username: '',
    refData: buildUserScopedRefData(),
    queryStringParameters: {
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      workflowId: 'GHWorkflow456',
      setting: 'visible',
      enabled: 'true'
    }
  })
  if (result.isSuccessResult) {
    expect(result.result).toEqual({
      accountId: 'GHAccount123',
      repoId: 'GHRepo456',
      workflowId: 'GHWorkflow456',
      setting: 'visible',
      enabled: true
    })
  } else {
    expect(result.failureResult).toEqual(invalidRequestResponse)
  }
})

test('Fails if no values in QS', () => {
  withSuppressedWarningLogs(() => {
    const result = parsePostUserSettingParameters({
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
