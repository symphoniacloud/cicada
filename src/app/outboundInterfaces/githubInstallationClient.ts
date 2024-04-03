import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { RawGithubWorkflowRunEvent } from '../domain/types/rawGithub/RawGithubWorkflowRunEvent'
import { RawGithubRepository } from '../domain/types/rawGithub/RawGithubRepository'
import { RawGithubUser } from '../domain/types/rawGithub/RawGithubUser'
import { RawGithubEvent } from '../domain/types/rawGithub/RawGithubEvent'
import { logger } from '../util/logging'

export interface GithubInstallationClient {
  listWorkflowRunsForRepo(owner: string, repo: string, created?: string): Promise<RawGithubWorkflowRunEvent[]>

  listOrganizationRepositories(org: string): Promise<RawGithubRepository[]>

  // Use when installation is for a personal user, not an organization
  listInstallationRepositories(): Promise<RawGithubRepository[]>

  listOrganizationMembers(org: string): Promise<RawGithubUser[]>

  listMostRecentEventsForRepo(owner: string, repo: string): Promise<RawGithubEvent[]>

  getUser(username: string): Promise<RawGithubUser>
}

export function createRealGithubInstallationClient(
  appId: string,
  privateKey: string,
  clientId: string,
  clientSecret: string,
  installationId: number
): GithubInstallationClient {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      clientId,
      clientSecret,
      installationId
    }
  })

  return {
    async listWorkflowRunsForRepo(owner: string, repo: string, created?: string) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await octokit.paginate(octokit.actions.listWorkflowRunsForRepo, {
        owner,
        repo,
        created
      })
    },
    // TOMaybe - consider other options here, e.g. type, sort
    async listOrganizationRepositories(org: string): Promise<RawGithubRepository[]> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await octokit.paginate(octokit.repos.listForOrg, { org })
    },
    async listInstallationRepositories(): Promise<RawGithubRepository[]> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, {})
    },
    async listOrganizationMembers(org: string): Promise<RawGithubUser[]> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await octokit.paginate(octokit.orgs.listMembers, { org })
    },
    // For now, hard code page size to 10
    // GitHub doesn't retain these for long - so anything older than a few days won't be returned
    async listMostRecentEventsForRepo(owner: string, repo: string): Promise<RawGithubEvent[]> {
      logger.debug(`List recent ${owner} ${repo}`)
      return (await octokit.activity.listRepoEvents({ owner, repo, per_page: 10 })).data
    },
    async getUser(username: string): Promise<RawGithubUser> {
      return (await octokit.users.getByUsername({ username })).data
    }
  }
}
