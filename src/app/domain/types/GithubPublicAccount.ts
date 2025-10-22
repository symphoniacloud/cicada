import { fromRawGithubAccountId, GithubAccountId, isGithubAccountId } from './GithubAccountId.js'
import { GithubAccountSummary, isGithubAccountSummary } from './GithubSummaries.js'
import { RawGithubUser } from './rawGithub/RawGithubUser.js'
import { fromRawAccountType } from './GithubAccountType.js'

export interface GithubPublicAccount extends GithubAccountSummary {
  installationAccountId: GithubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isGithubAccountSummary(x) && 'installationAccountId' in x && isGithubAccountId(x.installationAccountId)
  )
}

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GithubAccountId
): GithubPublicAccount {
  return {
    accountId: fromRawGithubAccountId(user.id),
    accountType: fromRawAccountType(user.type),
    accountName: user.login,
    installationAccountId
  }
}
