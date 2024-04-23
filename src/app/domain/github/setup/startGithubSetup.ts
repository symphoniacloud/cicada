import { GithubSetupAppState } from './githubSetupAppState'
import { generatePageViewResultWithoutHtmx } from '../../../web/views/viewResultWrappers'
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

  return generatePageViewResultWithoutHtmx(
    `<p>Hello! This is the Cicada GitHub App Setup screen.</p>
<p>Before continuing you need to know
whether you are setting up Cicada for a <b>personal</b> GitHub account, or an <b>organization</b>
GitHub Account. If you're not sure then the official GitHub docs
<a href="https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts">are here</a>.
</p>
<hr/>
<h3>Setup Cicada for a <b>PERSONAL</b> account</h3>
<p>To set up the Cicada GitHub up for a personal account - your own account - click the button below, and follow the pages.</p>
<form action="https://github.com/settings/apps/new?state=${callbackState}" method="post">
 <input type="text" name="manifest" id="personalManifest" hidden="hidden"><br>
 <button type="submit" class="btn btn-primary">Start GitHub App Creation Process for PERSONAL ACCOUNT</button>
</form>
<br>
<hr/>
<h3>Setup Cicada for an <b>ORGANIZATION</b> account</h3>
<p>To set up the Cicada GitHub up for an organziation account - which you must have admin-level access to:
<ol>
<li>Enter the organization login name in the box below</li>
<li>Click the button below, and follow the pages.</li>
</ol>
<br>
</p>
<form>
 <div class="form-group">
  <label for="orgNameBox">Organization Name:</label>
  <input type="text" name="orgNameBox" id="orgNameBox"><br>
 </div>
</form>
<form id="orgForm" method="post">
 <input type="text" name="manifest" id="orgManifest" hidden="hidden"><br>
 <button type="submit" id="orgButton" class="btn btn-default" disabled="disabled">Enter organization name before continuing</button>
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
    const orgName = document.getElementById("orgNameBox").value
    const orgIsNotEmpty = orgName.length > 0
    const orgButton = document.getElementById("orgButton")
    const orgForm = document.getElementById("orgForm")
    if (orgIsNotEmpty) {
      orgButton.removeAttribute('disabled')
      orgButton.className = "btn btn-primary"
      orgButton.textContent = "Start GitHub App Creation Process for " + orgName
      orgForm.action = "https://github.com/organizations/" + orgName + "/settings/apps/new?state=${callbackState}"
    } else {
      orgButton.disabled = "disabled"
      orgButton.className = "btn btn-default"
      orgButton.textContent = "Enter organization name before continuing"
      orgForm.action = ""
    }
  }) 
</script>`,
    false
  )
}
