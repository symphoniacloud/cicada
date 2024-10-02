import { a, td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'
import { GithubAccountSummary } from '../../domain/types/GithubSummaries'

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
