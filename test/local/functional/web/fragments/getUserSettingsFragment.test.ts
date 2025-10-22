import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState.js'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda.js'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs.js'
import {
  stubGetGithubInstallation,
  stubQueryLatestPushesPerRef,
  stubQueryLatestWorkflowRuns,
  stubQueryRepositories,
  stubQueryWorkflows,
  stubSetupUserRecords
} from '../../../../testSupport/fakes/tableRecordReadStubs.js'

test('get-user-settings-html', async () => {
  const appState = new FakeAppState()
  stubGetGithubInstallation(appState)
  stubSetupUserRecords(appState)
  stubQueryLatestPushesPerRef(appState)
  stubQueryRepositories(appState)
  stubQueryWorkflows(appState)
  // Used when loading "all workflows" for user settings lookup. Eventually consider adding a workflows entity
  stubQueryLatestWorkflowRuns(appState)

  const recentActivity = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/userSettings',
      httpMethod: 'GET'
    })
  )

  expect(recentActivity.statusCode).toEqual(200)
  expect(recentActivity.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(recentActivity.body).toEqual(`<div class="row" id="settings-GHAccount162483619">
  <h4>Account: cicada-test-org</h4>
  <div class="row">
    <div class="col-sm-1"></div>
    <div class="col-sm-11">
      <div class="row">
        <div class="col-sm-6"></div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&setting=visible&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Show</label>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&setting=notify&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Notify</label>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-1"></div>
    <div class="col-sm-11">
      <b>Repository</b>
    </div>
  </div>
  <div class="row" id="settings-GHAccount162483619-GHRepo768206479">
    <div class="col-sm-1"></div>
    <div class="col-sm-11">
      <div class="row">
        <div class="col-sm-6">org-test-repo-one</div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&repoId=GHRepo768206479&setting=visible&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619-GHRepo768206479"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Show</label>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&repoId=GHRepo768206479&setting=notify&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619-GHRepo768206479"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Notify</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-2"></div>
        <div class="col-sm-10">
          <b>Workflow</b>
        </div>
      </div>
      <div class="row" id="settings-GHAccount162483619-GHRepo768206479-GHWorkflow88508779">
        <div class="col-sm-2"></div>
        <div class="col-sm-4">Test Workflow</div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&repoId=GHRepo768206479&workflowId=GHWorkflow88508779&setting=visible&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619-GHRepo768206479-GHWorkflow88508779"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Show</label>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" checked="true" hx-post="/app/fragment/userSetting?accountId=GHAccount162483619&repoId=GHRepo768206479&workflowId=GHWorkflow88508779&setting=notify&enabled=false" hx-swap="outerHTML" hx-target="closest #settings-GHAccount162483619-GHRepo768206479-GHWorkflow88508779"></input>
            <label class="form-check-label" for="flexSwitchCheckChecked">Notify</label>
          </div>
        </div>
      </div>
      <div class="row">&nbsp;</div>
    </div>
  </div>
</div>`)
})
