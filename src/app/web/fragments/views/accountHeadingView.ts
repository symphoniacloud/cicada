import { fragmentViewResult } from '../../viewResultWrappers.js'
import { h3 } from '../../hiccough/hiccoughElements.js'
import { accountGithubAnchor } from '../../domainComponents/accountComponents.js'
import { GitHubAccountSummary } from '../../../ioTypes/GitHubTypes.js'

export function createAccountHeadingResponse(account: GitHubAccountSummary) {
  return fragmentViewResult(accountHeadingElement(account))
}

export function accountHeadingElement(account: GitHubAccountSummary) {
  return h3(`Account: ${account.accountName}`, `&nbsp;`, accountGithubAnchor(account))
}
