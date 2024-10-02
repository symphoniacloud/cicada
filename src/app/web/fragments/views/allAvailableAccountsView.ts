import { fragmentViewResult } from '../../viewResultWrappers'
import { standardTable } from '../../domainComponents/genericComponents'
import { td, tr } from '../../hiccough/hiccoughElements'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../domain/types/GithubAccountType'
import { accountCell } from '../../domainComponents/accountComponents'
import { GithubAccountSummary } from '../../../domain/types/GithubSummaries'
import { GithubPublicAccount } from '../../../domain/types/GithubPublicAccount'

export function createAllAvailableAccountsResponse(
  memberAccounts: GithubAccountSummary[],
  publicAccounts: GithubPublicAccount[]
) {
  return fragmentViewResult(...allAvailableAccountsResponse(memberAccounts, publicAccounts))
}

export function allAvailableAccountsResponse(
  memberAccounts: GithubAccountSummary[],
  publicAccounts: GithubPublicAccount[]
) {
  return [
    standardTable(
      ['Account', 'Type', 'Comment'],
      [
        ...memberAccounts.map((acc) => accountRow(acc, true)),
        ...publicAccounts.map((acc) => accountRow(acc, false))
      ]
    )
  ]
}

function accountRow(account: GithubAccountSummary, isInstalledAccount: boolean) {
  const isOrganizationAccount = account.accountType === ORGANIZATION_ACCOUNT_TYPE

  const comment = isInstalledAccount
    ? isOrganizationAccount
      ? 'You are a member'
      : 'Your personal account'
    : isOrganizationAccount
    ? 'Organization Account (only delayed public data)'
    : 'Your personal account (only delayed public data)'

  return tr(
    { class: isInstalledAccount ? 'table-primary' : 'table-light' },
    ...[accountCell(account), td(isOrganizationAccount ? 'Organization' : 'Personal Account'), td(comment)]
  )
}
