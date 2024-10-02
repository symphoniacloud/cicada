import { GithubAccountId, isGithubAccountId } from './GithubAccountId'
import { GithubAccountSummary, isGithubAccountSummary } from './GithubSummaries'

export interface GithubPublicAccount extends GithubAccountSummary {
  installationAccountId: GithubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isGithubAccountSummary(x) && 'installationAccountId' in x && isGithubAccountId(x.installationAccountId)
  )
}
