import { fragmentViewResult } from '../../viewResultWrappers.js'
import { standardTable } from '../../domainComponents/genericComponents.js'
import { td, tr } from '../../hiccough/hiccoughElements.js'
import { accountCell } from '../../domainComponents/accountComponents.js'

import { UserScopeReferenceData } from '../../../domain/types/UserScopeReferenceData.js'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../ioTypes/GitHubSchemas.js'
import { GitHubAccountSummary } from '../../../ioTypes/GitHubTypes.js'

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

function accountRow(account: GitHubAccountSummary, isInstalledAccount: boolean) {
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
