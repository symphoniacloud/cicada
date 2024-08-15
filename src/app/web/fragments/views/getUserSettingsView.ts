import { fragmentViewResult } from '../../viewResultWrappers'
import { b, div, h4, input, label } from '../../hiccough/hiccoughElements'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../../domain/types/UserSettings'
import { HiccoughContent, HiccoughElement } from '../../hiccough/hiccoughElement'
import { GithubAccountId, GithubRepoKey, GithubWorkflowKey } from '../../../domain/types/GithubKeys'

export function createGetUserSettingsResponse(settings: DisplayableUserSettings) {
  return fragmentViewResult(...userSettingsElement(settings))
}

export function userSettingsElement(settings: DisplayableUserSettings) {
  const elements = []
  for (const [accountId, accountSettings] of settings.github.accounts) {
    elements.push(accountControlsRow(accountId, accountSettings))
  }
  return elements
}

export function accountControlsRow(
  accountId: GithubAccountId,
  accountSettings: DisplayableGithubAccountSettings
) {
  const partialQs = `accountId=${accountId}`
  const targetId = `settings-${accountId}`
  const repoRows = []
  if (accountSettings.visible) {
    repoRows.push(divRow(colSm(1), colSm(11, b('Repository'))))
    for (const [repoId, repoSettings] of accountSettings.repos) {
      repoRows.push(repoControlsRow({ ownerId: accountId, repoId }, repoSettings))
    }
  }

  return div(
    { class: 'row', id: targetId },
    h4(`Account: ${accountSettings.name}`),
    divRow(colSm(1), colSm(11, divRow(colSm(6), ...switchCells(accountSettings, partialQs, targetId)))),
    ...repoRows
  )
}

export function repoControlsRow(repoKey: GithubRepoKey, repoSettings: DisplayableGithubRepoSettings) {
  const workflowRows: HiccoughElement[] = []
  if (repoSettings.visible) {
    workflowRows.push(divRow(colSm(2), colSm(10, b('Workflow'))))
    for (const [workflowId, workflowSettings] of repoSettings.workflows) {
      workflowRows.push(workflowControlsRow({ ...repoKey, workflowId }, workflowSettings))
    }
  }

  const { ownerId, repoId } = repoKey
  const partialQs = `accountId=${ownerId}&repoId=${repoId}`
  const targetId = `settings-${ownerId}-${repoId}`
  return div(
    { class: 'row', id: targetId },
    colSm(1),
    colSm(
      11,
      ...[
        divRow(colSm(6, repoSettings.name), ...switchCells(repoSettings, partialQs, targetId)),
        ...workflowRows,
        divRow('&nbsp;')
      ]
    )
  )
}

export function workflowControlsRow(
  { ownerId, repoId, workflowId }: GithubWorkflowKey,
  settings: DisplayableGithubWorkflowSettings
) {
  const partialQs = `accountId=${ownerId}&repoId=${repoId}&workflowId=${workflowId}`
  const targetId = `settings-${ownerId}-${repoId}-${workflowId}`
  return div(
    { class: 'row', id: targetId },
    colSm(2),
    colSm(4, settings.name),
    ...switchCells(settings, partialQs, targetId)
  )
}

function divRow(...content: HiccoughContent[]) {
  return div({ class: 'row' }, ...content)
}

function colSm(col: number, ...content: HiccoughContent[]) {
  return div({ class: `col-sm-${col}` }, ...content)
}

function switchCells(
  settings: Required<PersistedVisibleAndNotifyConfigurable>,
  partialQs: string,
  targetId: string
) {
  function switchElement(labelText: string, fieldName: string, checked: boolean, disabled: boolean) {
    const fullQs = `${partialQs}&setting=${fieldName}&enabled=${!checked}`

    return div(
      { class: 'form-check form-switch' },
      input({
        class: 'form-check-input',
        type: 'checkbox',
        role: 'switch',
        ...(checked ? { checked: 'true' } : {}),
        ...(disabled ? { disabled: 'true' } : {}),
        'hx-post': `/app/fragment/userSetting?${fullQs}`,
        'hx-swap': 'outerHTML',
        'hx-target': `closest #${targetId}`
      }),
      label({ class: 'form-check-label', for: 'flexSwitchCheckChecked' }, labelText)
    )
  }

  return [
    colSm(3, switchElement('Show', 'visible', settings.visible, false)),
    colSm(3, switchElement('Notify', 'notify', settings.notify, !settings.visible))
  ]
}
