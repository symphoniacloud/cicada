import { GithubSetupAppState } from './githubSetupAppState'
import { generateFragmentViewResult } from '../../../web/views/viewResultWrappers'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { Route } from '../../../internalHttpRouter/internalHttpRoute'

export const startSetupRoute: Route<APIGatewayProxyEvent, GithubSetupAppState> = {
  path: '/github/setup/start',
  target: startSetupHandler
}

async function startSetupHandler(appState: GithubSetupAppState) {
  if (appState.githubAppId) return setupAlreadyCompleteResponse
  return generateResponse(appState)
}

const setupAlreadyCompleteResponse = generateFragmentViewResult(`<p>
Cicada is already configured. <a href="/">Return to home</a>
</p>`)

// TODO - need different for organization
async function generateResponse(appState: GithubSetupAppState) {
  const { appName, webHostname, webhookCode, callbackState } = appState

  return generateFragmentViewResult(`<p>
<form action="https://github.com/settings/apps/new?state=${callbackState}" method="post">
 <input type="text" name="manifest" id="manifest" hidden="hidden"><br>
 <input type="submit" value="Start GitHub App Creation Process">
</form>
<script>
  input = document.getElementById("manifest")
  input.value = JSON.stringify({
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
</script>
</p>`)
}
