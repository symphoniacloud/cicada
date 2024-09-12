import { FakeAppState } from '../fakeAppState'
import { expect } from 'vitest'
import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { PutCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand'

export function expectPutsLength(appState: FakeAppState) {
  return expect(appState.dynamoDB.puts.length)
}

export function expectPut(appState: FakeAppState, index?: number) {
  return expect(appState.dynamoDB.puts[index ?? 0])
}

// TODO - use similar metadata object from stubber
export function buildPut(
  tableName: string,
  entityType: string,
  item: Record<string, NativeAttributeValue>,
  options?: Partial<PutCommandInput>
) {
  return {
    Item: {
      _et: entityType,
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...item
    },
    TableName: tableName,
    ...options
  }
}

export function expectBatchWritesLength(appState: FakeAppState) {
  return expect(appState.dynamoDB.batchWrites.length)
}

export function expectBatchWrites(appState: FakeAppState, index?: number) {
  return expect(appState.dynamoDB.batchWrites[index ?? 0])
}

export function buildBatchWriteForEntity(
  tableName: string,
  entityType: string,
  items: Record<string, NativeAttributeValue>[]
) {
  return {
    RequestItems: {
      [tableName]: items.map((item) => ({
        PutRequest: {
          Item: {
            _et: entityType,
            _lastUpdated: '2024-02-02T19:00:00.000Z',
            ...item
          }
        }
      }))
    }
  }
}
