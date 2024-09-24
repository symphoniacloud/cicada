import { fragmentViewResult } from '../../viewResultWrappers'
import { h3 } from '../../hiccough/hiccoughElements'
import { GithubAccount } from '../../../domain/types/GithubAccount'
import { accountGithubAnchor } from '../../domainComponents/accountComponents'

export function createAccountHeadingResponse(account: GithubAccount) {
  return fragmentViewResult(accountHeadingElement(account))
}

export function accountHeadingElement(account: GithubAccount) {
  return h3(`Account: ${account.accountLogin}`, `&nbsp;`, accountGithubAnchor(account))
}
