import { GithubSetupAppState } from './githubSetupAppState'
import { generateFragmentViewResult } from '../../../web/views/viewResultWrappers'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { Route } from '../../../internalHttpRouter/internalHttpRoute'

export const startSetupRoute: Route<APIGatewayProxyEvent, GithubSetupAppState> = {
  path: '/github/setup/start',
  target: startSetupHandler
}

async function startSetupHandler(appState: GithubSetupAppState) {
  return generateResponse(appState)
}

async function generateResponse(appState: GithubSetupAppState) {
  const { appName, webHostname, webhookCode, callbackState } = appState

  return generateFragmentViewResult(`<p>
<h2>Cicada Setup</h2>
<h3>Setup Cicada for a <b>PERSONAL</b> account</h3>
<form action="https://github.com/settings/apps/new?state=${callbackState}" method="post">
 <input type="text" name="manifest" id="personalManifest" hidden="hidden"><br>
 <input type="submit" value="Start GitHub App Creation Process for PERSONAL ACCOUNT">
</form>
<h3>Setup Cicada for an <b>ORGANIZATION</b> account</h3>
<input type="text" name="orgNameBox" id="orgNameBox"><br>
<form id="orgForm" method="post">
 <input type="text" name="manifest" id="orgManifest" hidden="hidden"><br>
 <input type="submit" value="Start GitHub App Creation Process for ORGANIZATION ACCOUNT">
</form>
<script>
  manifestConfig = JSON.stringify({
    name: "${appName}",
    url: 'https://github.com/symphoniacloud/cicada',
    hook_attributes: {
      url: "https://${webHostname}/github/webhook/${webhookCode}"
    },
    redirect_url: "https://${webHostname}/github/setup/redirect",
    callback_urls: ["https://${webHostname}/github/auth/callback"],
    setup_url: "https://${webHostname}",
    public: false,
    default_events: ['meta', 'organization', 'push', 'repository', 'workflow_job', 'workflow_run'],
    default_permissions: {
      actions: 'read',
      contents: 'read',
      metadata: 'read',
      members: 'read'
    }
  }) 
  document.getElementById("personalManifest").value = manifestConfig 
  document.getElementById("orgManifest").value = manifestConfig
  document.getElementById("orgNameBox").addEventListener("input", () => {
    document.getElementById("orgForm").action = "https://github.com/organizations/" + document.getElementById("orgNameBox").value + "/settings/apps/new?state=${callbackState}"
  }) 
</script>
</p>`)
}
