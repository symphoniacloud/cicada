import { GithubClient } from '../../../src/app/outboundInterfaces/githubClient.js'
import { GithubInstallationClient } from '../../../src/app/outboundInterfaces/githubInstallationClient.js'
import { OAuthAppAuthentication } from '@octokit/auth-oauth-user'
import { arrayStubResponse } from './fakeSupport.js'
import { FakeGithubInstallationClient } from './fakeGithubInstallationClient.js'

import { GitHubInstallationId } from '../../../src/app/ioTypes/GitHubTypes.js'
import { RawGithubUser } from '../../../src/app/ioTypes/RawGitHubTypes.js'
import { failedWith, successWith } from '../../../src/app/util/structuredResult.js'

export class FakeGithubClient implements GithubClient {
  public fakeClientsForInstallation = arrayStubResponse<GitHubInstallationId, FakeGithubInstallationClient>()
  public stubInstallations: unknown[] = []
  public stubOAuthUserAuths = arrayStubResponse<string, OAuthAppAuthentication>()
  public stubGithubUsers = arrayStubResponse<string, RawGithubUser>()

  clientForInstallation(installationId: GitHubInstallationId): GithubInstallationClient {
    return this.fakeClientsForInstallation.getResponseOrThrow(installationId)
  }

  async listInstallations(): Promise<unknown[]> {
    return this.stubInstallations
  }

  async createOAuthUserAuth(code: string) {
    return this.stubOAuthUserAuths.getResponseOrThrow(code)
  }

  async getGithubUser(token: string) {
    const response = this.stubGithubUsers.getResponse(token)
    return response ? successWith(response) : failedWith('user not available')
  }
}
