import { fragmentViewResult } from '../../viewResultWrappers.js'
import { h3 } from '../../hiccough/hiccoughElements.js'
import { GithubAccountSummary } from '../../../domain/types/GithubSummaries.js'
import { accountGithubAnchor } from '../../domainComponents/accountComponents.js'

export function createAccountHeadingResponse(account: GithubAccountSummary) {
  return fragmentViewResult(accountHeadingElement(account))
}

export function accountHeadingElement(account: GithubAccountSummary) {
  return h3(`Account: ${account.accountName}`, `&nbsp;`, accountGithubAnchor(account))
}
