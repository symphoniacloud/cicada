import { GithubPublicAccount } from '../../../domain/types/GithubPublicAccount'
import { pageViewResponse } from '../../viewResultWrappers'
import { b, button, div, form, h1, h2, input, label } from '../../hiccough/hiccoughElements'
import { colAuto, divRow } from '../../hiccoughCicada/hiccoughBootstrapElements'
import { githubAnchor } from '../../domainComponents/genericComponents'
import { adminAddPublicAccountPageRoute } from '../adminAddPublicAccountPage'

export function createAdminPageResponse(publicAccounts: GithubPublicAccount[]) {
  return pageViewResponse(
    [
      h1({ class: 'display-3 mt-4' }, 'Cicada Admin'),
      h2('Additional Public GitHub Accounts'),
      // TOEventually - make this nicer by adding some headers, maybe
      ...publicAccounts.map(toPublicAccountRow),
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

function toPublicAccountRow({ username }: GithubPublicAccount) {
  return divRow(div({ class: 'col mt-1' }, b(`${username}`), githubAnchor(`https://github.com/${username}`)))
}
