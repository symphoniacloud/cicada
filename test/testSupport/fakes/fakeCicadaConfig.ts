import {
  CicadaConfig,
  GithubConfig,
  TableNames,
  WebPushVapidConfig
} from '../../../src/app/environment/config'

export const defaultFakeWebHostname = 'fake-cicada.example.com'

export class FakeCicadaConfig implements CicadaConfig {
  public appName = 'fake-cicada'
  public fakeWebHostname = defaultFakeWebHostname

  public fakeTableNames: TableNames = {
    'github-installations': 'fakeGithubInstallationsTable',
    'github-user-tokens': 'fakeGithubUserTokensTable',
    'github-users': 'fakeGithubUsersTable',
    'github-account-memberships': 'fakeGithubAccountMemberships',
    'github-repositories': 'fakeGithubRepositoriesTable',
    'github-repo-activity': 'fakeGithubRepoActivityTable',
    'github-latest-workflow-runs': 'fakeGithubLatestWorkflowRunsTable',
    'github-latest-pushes-per-ref': 'fakeGithubLatestPushesPerRefTable',
    'user-settings': 'fakeUserSettingsTable',
    'web-push-subscriptions': 'fakeWebPushSubscriptions'
  }
  public fakeWebpushVapidConfig: WebPushVapidConfig = {
    privateKey: 'fakeWebpushPrivateKey',
    subject: 'fakeWebpushSubject',
    publicKey: 'fakeWebpushPublicKey'
  }
  public fakeGithubConfig: GithubConfig = {
    appId: '',
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
    return this.fakeTableNames
  }

  async webHostname(): Promise<string> {
    return this.fakeWebHostname
  }
}
