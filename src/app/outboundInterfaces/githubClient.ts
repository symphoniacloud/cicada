import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { createRealGithubInstallationClient, GithubInstallationClient } from './githubInstallationClient.js'
import { RawGithubInstallation } from '../domain/types/rawGithub/RawGithubInstallation.js'
import { GithubConfig } from '../environment/config.js'
import { OAuthAppAuthentication } from '@octokit/auth-oauth-user'
import { createOAuthUserAuth } from '@octokit/auth-oauth-user'
import { logger } from '../util/logging.js'
import { RawGithubUser } from '../domain/types/rawGithub/RawGithubUser.js'
import { GithubInstallationId } from '../domain/types/GithubInstallationId.js'

import { toRawGithubAppId } from '../domain/types/toFromRawGitHubIds.js'

export interface GithubClient {
  clientForInstallation(installationId: GithubInstallationId): GithubInstallationClient

  listInstallations(): Promise<RawGithubInstallation[]>

  createOAuthUserAuth(code: string): Promise<OAuthAppAuthentication>

  getGithubUser(token: string): Promise<RawGithubUser | undefined>
}

export function createRealGithubClient({
  appId,
  clientId,
  clientSecret,
  privateKey
}: GithubConfig): GithubClient {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: toRawGithubAppId(appId),
      privateKey,
      clientId,
      clientSecret
    }
  })

  const perInstallation: Record<GithubInstallationId, GithubInstallationClient> = {}

  return {
    // TOEventually - in theory we should be able to create installation client using app client's octokit
    clientForInstallation(installationId: GithubInstallationId): GithubInstallationClient {
      if (!perInstallation[installationId]) {
        perInstallation[installationId] = createRealGithubInstallationClient(
          appId,
          privateKey,
          clientId,
          clientSecret,
          installationId
        )
      }

      return perInstallation[installationId]
    },
    async listInstallations(): Promise<RawGithubInstallation[]> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await octokit.paginate(octokit.apps.listInstallations)
    },
    // See https://github.com/octokit/auth-oauth-user.js#createoauthuserauthoptions-or-new-octokit-auth-
    async createOAuthUserAuth(code: string): Promise<OAuthAppAuthentication> {
      return createOAuthUserAuth({
        code,
        clientId,
        clientSecret
      })()
    },
    async getGithubUser(token: string) {
      function createOctokit() {
        try {
          return new Octokit({ auth: token })
        } catch (e) {
          logger.info(`Failed to create user octokit: ${e}`)
        }
        return undefined
      }

      async function getGithubUser() {
        try {
          return await createOctokit()?.users.getAuthenticated()
        } catch (e) {
          logger.info(`Failed to get authenticated user: ${e}`)
        }
        return undefined
      }

      const foo = await getGithubUser()
      return foo ? foo.data : undefined
    }
  }
}
