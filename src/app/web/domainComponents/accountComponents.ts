import { a, td } from '../hiccough/hiccoughElements.js'
import { githubAnchor } from './genericComponents.js'
import { GithubAccountSummary } from '../../domain/types/GithubSummaries.js'

export function accountCell(account: GithubAccountSummary) {
  return td(
    a(`/account?id=${account.accountId}`, account.accountName),
    '&nbsp;',
    accountGithubAnchor(account)
  )
}

export function accountGithubAnchor(account: GithubAccountSummary) {
  return githubAnchor(`https://github.com/${account.accountName}`)
}
