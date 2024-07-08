export interface GithubUserToken {
  token: string
  userId: number
  userLogin: string
  nextCheckTime: number
}

export function isGithubUserToken(x: unknown): x is GithubUserToken {
  const candidate = x as GithubUserToken
  return (
    candidate.token !== undefined &&
    candidate.userId !== undefined &&
    candidate.userLogin !== undefined &&
    candidate.nextCheckTime !== undefined
  )
}
