import { NativeAttributeValue } from '@aws-sdk/util-dynamodb/dist-types/models'

export function parseDynamoDBDictToMap<TKey, TValue>(
  parseKey: (x: string) => TKey,
  parseValue: (x: NativeAttributeValue) => TValue,
  unparsed: { [key: string]: NativeAttributeValue }
): Map<TKey, TValue> {
  return new Map<TKey, TValue>(
    Object.entries(unparsed).map(([key, value]) => {
      return [parseKey(key), parseValue(value)]
    })
  )
}
