import { fragmentViewResult } from '../../viewResultWrappers'
import { h3 } from '../../hiccough/hiccoughElements'
import { GithubAccountSummary } from '../../../domain/types/GithubSummaries'
import { accountGithubAnchor } from '../../domainComponents/accountComponents'

export function createAccountHeadingResponse(account: GithubAccountSummary) {
  return fragmentViewResult(accountHeadingElement(account))
}

export function accountHeadingElement(account: GithubAccountSummary) {
  return h3(`Account: ${account.accountName}`, `&nbsp;`, accountGithubAnchor(account))
}
