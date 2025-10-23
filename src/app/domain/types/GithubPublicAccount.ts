import { GithubAccountSummary, isGithubAccountSummary } from './GithubSummaries.js'
import { RawGithubUser } from './rawGithub/RawGithubUser.js'
import { fromRawAccountType } from './GithubAccountType.js'
import { GitHubAccountId, isGitHubAccountId } from '../../types/GitHubIdTypes.js'
import { fromRawGitHubAccountId } from './toFromRawGitHubIds.js'

export interface GithubPublicAccount extends GithubAccountSummary {
  installationAccountId: GitHubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isGithubAccountSummary(x) && 'installationAccountId' in x && isGitHubAccountId(x.installationAccountId)
  )
}

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GitHubAccountId
): GithubPublicAccount {
  return {
    accountId: fromRawGitHubAccountId(user.id),
    accountType: fromRawAccountType(user.type),
    accountName: user.login,
    installationAccountId
  }
}
