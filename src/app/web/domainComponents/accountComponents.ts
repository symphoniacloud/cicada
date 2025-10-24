import { a, td } from '../hiccough/hiccoughElements.js'
import { githubAnchor } from './genericComponents.js'

import { GitHubAccountSummary } from '../../ioTypes/GitHubTypes.js'

export function accountCell(account: GitHubAccountSummary) {
  return td(
    a(`/account?id=${account.accountId}`, account.accountName),
    '&nbsp;',
    accountGithubAnchor(account)
  )
}

export function accountGithubAnchor(account: GitHubAccountSummary) {
  return githubAnchor(`https://github.com/${account.accountName}`)
}
