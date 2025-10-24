import { RawGithubUser } from './rawGithub/RawGithubUser.js'
import { fromRawAccountType } from './fromRawGitHub.js'
import { fromRawGitHubAccountId } from './toFromRawGitHubIds.js'
import { isGitHubAccountId, isGitHubAccountSummary } from '../../types/GitHubTypeChecks.js'
import { GitHubAccountId, GitHubAccountSummary } from '../../types/GitHubTypes.js'

export interface GithubPublicAccount extends GitHubAccountSummary {
  installationAccountId: GitHubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isGitHubAccountSummary(x) && 'installationAccountId' in x && isGitHubAccountId(x.installationAccountId)
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
