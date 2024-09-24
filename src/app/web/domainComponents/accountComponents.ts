import { GithubAccount } from '../../domain/types/GithubAccount'
import { a, td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function accountCell(account: GithubAccount) {
  return td(
    a(`/account?id=${account.accountId}`, account.accountLogin),
    '&nbsp;',
    githubAnchor(`https://github.com/${account.accountLogin}`)
  )
}
