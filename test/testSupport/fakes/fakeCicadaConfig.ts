import {
  CicadaConfig,
  GithubConfig,
  TableNames,
  WebPushVapidConfig
} from '../../../src/app/environment/config'
import { fromRawGithubAppId } from '../../../src/app/domain/types/GithubAppId'

export const defaultFakeWebHostname = 'fake-cicada.example.com'

export const fakeTableNames: TableNames = {
  'github-installations': 'fakeGithubInstallationsTable',
  'github-user-tokens': 'fakeGithubUserTokensTable',
  'github-users': 'fakeGithubUsersTable',
  'github-account-memberships': 'fakeGithubAccountMemberships',
  'github-repositories': 'fakeGithubRepositoriesTable',
  'github-workflows': 'fakeGithubWorkflowsTable',
  'github-repo-activity': 'fakeGithubRepoActivityTable',
  'github-latest-workflow-runs': 'fakeGithubLatestWorkflowRunsTable',
  'github-latest-pushes-per-ref': 'fakeGithubLatestPushesPerRefTable',
  'github-public-accounts': 'fakeGithubPublicAccounts',
  'user-settings': 'fakeUserSettingsTable',
  'web-push-subscriptions': 'fakeWebPushSubscriptions'
}

export class FakeCicadaConfig implements CicadaConfig {
  public appName = 'fake-cicada'
  public fakeWebHostname = defaultFakeWebHostname

  public fakeWebpushVapidConfig: WebPushVapidConfig = {
    privateKey: 'fakeWebpushPrivateKey',
    subject: 'fakeWebpushSubject',
    publicKey: 'fakeWebpushPublicKey'
  }
  public fakeGithubConfig: GithubConfig = {
    appId: fromRawGithubAppId(123),
    clientId: '',
    clientSecret: '',
    privateKey: '',
    webhookSecret: 'fakeWebhookSecret',
    githubCallbackState: 'testCallbackState'
  }

  async github(): Promise<GithubConfig> {
    return this.fakeGithubConfig
  }

  async webPush(): Promise<WebPushVapidConfig> {
    return this.fakeWebpushVapidConfig
  }

  async tableNames(): Promise<TableNames> {
    return fakeTableNames
  }

  async webHostname(): Promise<string> {
    return this.fakeWebHostname
  }
}
