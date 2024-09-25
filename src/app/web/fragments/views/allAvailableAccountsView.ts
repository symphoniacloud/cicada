import { fragmentViewResult } from '../../viewResultWrappers'
import { GithubAccount, INSTALLED_ACCOUNT_TYPE } from '../../../domain/types/GithubAccount'
import { standardTable } from '../../domainComponents/genericComponents'
import { td, tr } from '../../hiccough/hiccoughElements'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../domain/types/GithubAccountType'
import { accountCell } from '../../domainComponents/accountComponents'

export function createAllAvailableAccountsResponse(accounts: GithubAccount[]) {
  return fragmentViewResult(...allAvailableAccountsResponse(accounts))
}

export function allAvailableAccountsResponse(accounts: GithubAccount[]) {
  return [standardTable(['Account', 'Type', 'Comment'], accounts.map(accountRow))]
}

function accountRow(account: GithubAccount) {
  const isInstalledAccount = account.cicadaAccountType === INSTALLED_ACCOUNT_TYPE
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
