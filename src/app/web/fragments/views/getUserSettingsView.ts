import { fragmentViewResult } from '../../viewResultWrappers.js'
import { b, div, h4, input, label } from '../../hiccough/hiccoughElements.js'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../../domain/types/UserSettings.js'
import { HiccoughElement } from '../../hiccough/hiccoughElement.js'
import { colSm, divRow } from '../../hiccoughCicada/hiccoughBootstrapElements.js'
import {
  GitHubAccountId,
  GitHubRepoId,
  GitHubRepoKey,
  GitHubWorkflowId,
  GitHubWorkflowKey
} from '../../../types/GitHubTypes.js'

export function createGetUserSettingsResponse(
  settings: DisplayableUserSettings,
  memberAccountId: GitHubAccountId
) {
  return fragmentViewResult(...userSettingsElement(settings, memberAccountId))
}

export function userSettingsElement(settings: DisplayableUserSettings, memberAccountId: GitHubAccountId) {
  // Show member account first, then public accounts
  // TOEventually - when a user can be a member of multiple accounts then change this
  const elements = [accountControlsRow(memberAccountId, settings.github.accounts[memberAccountId])]

  for (const [accountId, accountSettings] of Object.entries(settings.github.accounts)) {
    if (!(accountId === memberAccountId))
      elements.push(accountControlsRow(accountId as GitHubAccountId, accountSettings))
  }
  return elements
}

export function accountControlsRow(
  accountId: GitHubAccountId,
  accountSettings: DisplayableGithubAccountSettings
) {
  const partialQs = `accountId=${accountId}`
  const targetId = `settings-${accountId}`
  const repoRows = []
  if (accountSettings.visible) {
    repoRows.push(divRow(colSm(1), colSm(11, b('Repository'))))
    for (const [repoId, repoSettings] of Object.entries(accountSettings.repos)) {
      repoRows.push(repoControlsRow({ accountId, repoId: repoId as GitHubRepoId }, repoSettings))
    }
  }

  return div(
    { class: 'row', id: targetId },
    h4(`Account: ${accountSettings.name}`),
    divRow(colSm(1), colSm(11, divRow(colSm(6), ...switchCells(accountSettings, partialQs, targetId)))),
    ...repoRows
  )
}

export function repoControlsRow(repoKey: GitHubRepoKey, repoSettings: DisplayableGithubRepoSettings) {
  const workflowRows: HiccoughElement[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const workflowEntries = Object.entries(repoSettings.workflows).sort(([_, a], [__, b]) =>
    a.name < b.name ? -1 : 1
  )
  if (repoSettings.visible && workflowEntries.length > 0) {
    workflowRows.push(divRow(colSm(2), colSm(10, b('Workflow'))))
    for (const [workflowId, workflowSettings] of workflowEntries) {
      workflowRows.push(
        workflowControlsRow({ ...repoKey, workflowId: workflowId as GitHubWorkflowId }, workflowSettings)
      )
    }
    workflowRows.push(divRow('&nbsp;'))
  }

  const { accountId, repoId } = repoKey
  const partialQs = `accountId=${accountId}&repoId=${repoId}`
  const targetId = `settings-${accountId}-${repoId}`
  return div(
    { class: 'row', id: targetId },
    colSm(1),
    colSm(
      11,
      ...[
        divRow(colSm(6, repoSettings.name), ...switchCells(repoSettings, partialQs, targetId)),
        ...workflowRows
      ]
    )
  )
}

export function workflowControlsRow(
  { accountId, repoId, workflowId }: GitHubWorkflowKey,
  settings: DisplayableGithubWorkflowSettings
) {
  const partialQs = `accountId=${accountId}&repoId=${repoId}&workflowId=${workflowId}`
  const targetId = `settings-${accountId}-${repoId}-${workflowId}`
  return div(
    { class: 'row', id: targetId },
    colSm(2),
    colSm(4, settings.name),
    ...switchCells(settings, partialQs, targetId)
  )
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
