export function modifyControls(document, appName, webHostname, webhookCode, callbackState) {
  const manifestConfig = JSON.stringify({
    name: appName,
    url: 'https://github.com/symphoniacloud/cicada',
    hook_attributes: {
      url: `https://${webHostname}/github/webhook/${webhookCode}`
    },
    redirect_url: `https://${webHostname}/github/setup/redirect`,
    callback_urls: [`https://${webHostname}/github/auth/callback`],
    setup_url: `https://${webHostname}`,
    public: false,
    // If changing here, also change WebhookTypeSchema
    default_events: ['meta', 'organization', 'push', 'repository', 'workflow_job', 'workflow_run'],
    default_permissions: {
      actions: 'read',
      contents: 'read',
      metadata: 'read',
      members: 'read'
    }
  })

  document.getElementById('personalManifest').value = manifestConfig
  document.getElementById('orgManifest').value = manifestConfig
  document.getElementById('orgNameBox').addEventListener('input', () => {
    const orgName = document.getElementById('orgNameBox').value
    const orgIsNotEmpty = orgName.length > 0
    const orgButton = document.getElementById('orgButton')
    const orgForm = document.getElementById('orgForm')
    if (orgIsNotEmpty) {
      orgButton.removeAttribute('disabled')
      orgButton.className = 'btn btn-primary'
      orgButton.textContent = 'Start GitHub App Creation Process for ' + orgName
      orgForm.action =
        'https://github.com/organizations/' + orgName + '/settings/apps/new?state=' + callbackState
    } else {
      orgButton.disabled = 'disabled'
      orgButton.className = 'btn btn-default'
      orgButton.textContent = 'Enter organization name before continuing'
      orgForm.action = ''
    }
  })
}
