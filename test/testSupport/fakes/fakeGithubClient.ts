import { GithubClient } from '../../../src/app/outboundInterfaces/githubClient'
import { GithubInstallationClient } from '../../../src/app/outboundInterfaces/githubInstallationClient'
import { RawGithubInstallation } from '../../../src/app/domain/types/rawGithub/RawGithubInstallation'
import { OAuthAppAuthentication } from '@octokit/auth-oauth-user/dist-types/types'
import { arrayStubResponse } from './fakeSupport'
import { RawGithubUser } from '../../../src/app/domain/types/rawGithub/RawGithubUser'
import { FakeGithubInstallationClient } from './fakeGithubInstallationClient'

/* eslint-disable @typescript-eslint/no-unused-vars */

export class FakeGithubClient implements GithubClient {
  public fakeClientsForInstallation = arrayStubResponse<number, FakeGithubInstallationClient>()
  public stubInstallations: RawGithubInstallation[] = []
  public stubOAuthUserAuths = arrayStubResponse<string, OAuthAppAuthentication>()
  public stubGithubUsers = arrayStubResponse<string, RawGithubUser>()

  clientForInstallation(installationId: number): GithubInstallationClient {
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
