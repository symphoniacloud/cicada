import deepEqual from 'deep-equal'
import { throwFunction } from '../../../src/multipleContexts/errors'

export interface StubResponse<TInput, TOutput> {
  addResponse(input: TInput, output: TOutput): void

  getResponse(input: TInput): TOutput | undefined

  getResponseOrThrow(input: TInput): TOutput
}

export function arrayStubResponse<TInput, TOutput>(): StubResponse<TInput, TOutput> {
  const stubs: [TInput, TOutput][] = []
  return {
    addResponse(input: TInput, output: TOutput) {
      stubs.push([input, output])
    },
    getResponse(input: TInput): TOutput | undefined {
      return stubs.find(([stubInput]) => deepEqual(input, stubInput))?.[1]
    },
    getResponseOrThrow(input: TInput): TOutput {
      const findElement = stubs.find(([stubInput]) => deepEqual(input, stubInput))?.[1]
      return findElement ?? throwFunction(`No stub for ${JSON.stringify(input)}`)()
    }
  }
}
