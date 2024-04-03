// Useful for things like nullish coalescing where wanting to throw error on undefined
// E.g. return foo ?? throwFunction('Not found')()
export function throwFunction(message?: string) {
  return () => {
    throw new Error(message)
  }
}
