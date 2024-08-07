import { fragmentViewResult } from '../../viewResultWrappers'
import { b, div, h4, input, label } from '../../hiccough/hiccoughElements'
import { DisplayableUserSettings } from '../../../domain/types/UserSettings'
import { HiccoughContent, HiccoughElement } from '../../hiccough/hiccoughElement'

export function createUserSettingsResponse(settings: DisplayableUserSettings) {
  return fragmentViewResult(...userSettingsElement(settings))
}

export function userSettingsElement(settings: DisplayableUserSettings) {
  const elements = []
  for (const [accountId, accountSettings] of settings.github.accounts) {
    const accountIdPart = `accountId=${accountId}`
    elements.push(h4(`Account: ${accountSettings.name}`))
    elements.push(
      divRow(
        colSm(1),
        colSm(
          11,
          divRow(
            colSm(6),
            colSm3(switchElement('Show', 'visible', accountSettings.visible, accountIdPart)),
            colSm3(switchElement('Notify', 'notify', accountSettings.notify, accountIdPart))
          )
        )
      )
    )
    elements.push(divRow(colSm(1), colSm(11, b('Repository'))))
    for (const [repoId, repoSettings] of accountSettings.repos) {
      const accountAndRepoIdPart = `${accountIdPart}&repoId=${repoId}`

      const workflowRows: HiccoughElement[] = []
      for (const [workflowId, workflowSettings] of repoSettings.workflows) {
        const accountAndRepoAndWorkflowIdPart = `${accountAndRepoIdPart}&workflowId=${workflowId}`
        workflowRows.push(
          divRow(
            colSm(2),
            colSm(4, workflowSettings.name),
            colSm3(
              switchElement('Show', 'visible', workflowSettings.visible, accountAndRepoAndWorkflowIdPart)
            ),
            colSm3(
              switchElement('Notify', 'notify', workflowSettings.notify, accountAndRepoAndWorkflowIdPart)
            )
          )
        )
      }

      elements.push(
        divRow(
          colSm(1),
          colSm(
            11,
            ...[
              divRow(
                colSm(6, repoSettings.name),
                colSm3(switchElement('Show', 'visible', repoSettings.visible, accountAndRepoIdPart)),
                colSm3(switchElement('Notify', 'notify', repoSettings.notify, accountAndRepoIdPart))
              ),
              divRow(colSm(2), colSm(10, b('Workflow'))),
              ...workflowRows,
              divRow('&nbsp;')
            ]
          )
        )
      )
    }
  }

  return elements
}

function divRow(...content: HiccoughContent[]) {
  return div({ class: 'row' }, ...content)
}

function colSm(col: number, ...content: HiccoughContent[]) {
  return div({ class: `col-sm-${col}` }, ...content)
}

function colSm3(...content: HiccoughContent[]) {
  return colSm(3, ...content)
}

function switchElement(labelText: string, fieldName: string, checked: boolean, partialQs: string) {
  const fullQs = `${partialQs}&setting=${fieldName}&enabled=${!checked}`

  return div(
    { class: 'form-check form-switch' },
    input({
      class: 'form-check-input',
      type: 'checkbox',
      role: 'switch',
      // TODO - path
      'hx-post': `/TODOPATH/updateSetting?${fullQs}`,
      ...(checked ? { checked: 'true' } : {})
    }),
    label({ class: 'form-check-label', for: 'flexSwitchCheckChecked' }, labelText)
  )
}
