import { GithubAccount } from '../../domain/types/GithubAccount'
import { a, td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function accountCell(account: GithubAccount) {
  return td(
    a(`/account?id=${account.accountId}`, account.accountLogin),
    '&nbsp;',
    accountGithubAnchor(account)
  )
}

export function accountGithubAnchor(account: GithubAccount) {
  return githubAnchor(`https://github.com/${account.accountLogin}`)
}
