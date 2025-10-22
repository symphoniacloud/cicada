import { fragmentViewResult } from '../../viewResultWrappers'
import { standardTable } from '../../domainComponents/genericComponents'
import { td, tr } from '../../hiccough/hiccoughElements'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../domain/types/GithubAccountType'
import { accountCell } from '../../domainComponents/accountComponents'
import { GithubAccountSummary } from '../../../domain/types/GithubSummaries'

import { UserScopeReferenceData } from '../../../domain/types/UserScopeReferenceData'

export function createAllAvailableAccountsResponse(refData: UserScopeReferenceData) {
  return fragmentViewResult(...allAvailableAccountsResponse(refData))
}

export function allAvailableAccountsResponse(refData: UserScopeReferenceData) {
  return [
    standardTable(
      ['Account', 'Type', 'Comment'],
      [
        accountRow(refData.memberAccount, true),
        ...Object.values(refData.publicAccounts).map((acc) => accountRow(acc, false))
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
