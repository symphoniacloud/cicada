import { pageViewResponse } from '../../viewResultWrappers.js'
import { button, div, form, h1, h2, input, label, td, tr } from '../../hiccough/hiccoughElements.js'
import { colAuto } from '../../hiccoughCicada/hiccoughBootstrapElements.js'
import { standardTable } from '../../domainComponents/genericComponents.js'
import { adminAddPublicAccountPageRoute } from '../adminAddPublicAccountPage.js'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../../domain/types/GithubAccountType.js'
import { accountCell } from '../../domainComponents/accountComponents.js'
import { GithubAccountSummary } from '../../../domain/types/GithubSummaries.js'

export function createAdminPageResponse(publicAccounts: GithubAccountSummary[]) {
  return pageViewResponse(
    [
      h1({ class: 'display-3 mt-4' }, 'Cicada Admin'),
      h2('Additional Public GitHub Accounts'),
      standardTable(['Account', 'Type'], publicAccounts.map(accountRow)),
      div(
        { class: 'alert alert-warning', role: 'alert' },
        '<b>Careful!</b> If you add large public accounts, or many public accounts, you may have problems with Cicada being rate limited by GitHub while accessing the GitHub API.'
      ),
      form(
        { class: 'row mt-3' },
        colAuto(label({ for: 'newPublicAccountInput', class: 'col-form-label' }, 'New Account')),
        colAuto(input({ id: 'newPublicAccountInput', name: 'accountName', class: 'form-control' })),
        colAuto(
          button(
            {
              formaction: adminAddPublicAccountPageRoute.path,
              formmethod: 'post',
              type: 'submit',
              class: 'btn btn-primary'
            },
            'Add'
          )
        )
      )
    ],
    {
      title: 'Cicada Admin'
    }
  )
}

function accountRow(account: GithubAccountSummary) {
  return tr(
    ...[
      accountCell({ ...account }),
      td(account.accountType === ORGANIZATION_ACCOUNT_TYPE ? 'Organization' : 'Personal Account')
    ]
  )
}
