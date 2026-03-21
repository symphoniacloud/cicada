import { fragmentViewResult } from '../../viewResultWrappers.js'
import { h3, raw } from '@symphoniacloud/hiccough'
import { accountGithubAnchor } from '../../domainComponents/accountComponents.js'
import { GitHubAccountSummary } from '../../../ioTypes/GitHubTypes.js'

export function createAccountHeadingResponse(account: GitHubAccountSummary) {
  return fragmentViewResult(accountHeadingElement(account))
}

export function accountHeadingElement(account: GitHubAccountSummary) {
  return h3(`Account: ${account.accountName}`, raw('&nbsp;'), accountGithubAnchor(account))
}
