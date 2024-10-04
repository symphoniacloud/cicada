export function pagePath(suffix: string) {
  return `/app/${suffix}`
}

export function fragmentPath(suffix: string) {
  return `/app/fragment/${suffix}`
}

export function isFragmentPath(path: string) {
  return path.startsWith('/app/fragment/')
}

export function authenticateApiPath(suffix: string) {
  return `/apia/${suffix}`
}
