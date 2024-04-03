import deepEqual from 'deep-equal'

function filterKeys<T extends object>(object: T, keyPredicate: (key: string) => boolean) {
  return object ? Object.fromEntries(Object.entries(object).filter(([key]) => keyPredicate(key))) : object
}

export function selectKeys<T extends object>(object: T, keys: string[]) {
  return filterKeys(object, (key) => keys.includes(key))
}

export function excludeKeys<T extends object>(object: T, keys: string[]) {
  return filterKeys(object, (key) => !keys.includes(key))
}

export function mergeOrderedLists<T>(xs: T[], ys: T[], comparator: (x: T, y: T) => boolean): T[] {
  let nextXsIndex = 0
  let nextYsIndex = 0
  const merged: T[] = []
  while (nextXsIndex + nextYsIndex < xs.length + ys.length) {
    const nextElementFromXs =
      nextXsIndex !== xs.length && (nextYsIndex === ys.length || comparator(xs[nextXsIndex], ys[nextYsIndex]))
    if (nextElementFromXs) {
      merged.push(xs[nextXsIndex])
      nextXsIndex++
    } else {
      merged.push(ys[nextYsIndex])
      nextYsIndex++
    }
  }
  return merged
}

/**
 * Returns elements of xs not in ys, using deepEqual equality over each element
 * Set.prototype.difference() isn't implemented in Node
 */
export function arrayDifferenceDeep<T>(xs: T[], ys: T[]): T[] {
  return xs.filter((x) => !ys.find((y) => deepEqual(x, y)))
}

export type NonEmptyArray<T> = [T, ...T[]]
