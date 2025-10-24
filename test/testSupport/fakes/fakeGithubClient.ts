import { GithubClient } from '../../../src/app/outboundInterfaces/githubClient.js'
import { GithubInstallationClient } from '../../../src/app/outboundInterfaces/githubInstallationClient.js'
import { RawGithubInstallation } from '../../../src/app/domain/types/rawGithub/RawGithubInstallation.js'
import { OAuthAppAuthentication } from '@octokit/auth-oauth-user'
import { arrayStubResponse } from './fakeSupport.js'
import { RawGithubUser } from '../../../src/app/domain/types/rawGithub/RawGithubUser.js'
import { FakeGithubInstallationClient } from './fakeGithubInstallationClient.js'

import { GitHubInstallationId } from '../../../src/app/types/GitHubTypes.js'

/* eslint-disable @typescript-eslint/no-unused-vars */

export class FakeGithubClient implements GithubClient {
  public fakeClientsForInstallation = arrayStubResponse<GitHubInstallationId, FakeGithubInstallationClient>()
  public stubInstallations: RawGithubInstallation[] = []
  public stubOAuthUserAuths = arrayStubResponse<string, OAuthAppAuthentication>()
  public stubGithubUsers = arrayStubResponse<string, RawGithubUser>()

  clientForInstallation(installationId: GitHubInstallationId): GithubInstallationClient {
    return this.fakeClientsForInstallation.getResponseOrThrow(installationId)
  }

  async listInstallations(): Promise<RawGithubInstallation[]> {
    return this.stubInstallations
  }

  async createOAuthUserAuth(code: string) {
    return this.stubOAuthUserAuths.getResponseOrThrow(code)
  }

  async getGithubUser(token: string) {
    return this.stubGithubUsers.getResponse(token)
  }
}
