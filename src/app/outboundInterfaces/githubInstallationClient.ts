import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { RawGithubWorkflowRunEvent } from '../domain/types/rawGithub/RawGithubWorkflowRunEvent'
import { RawGithubRepository } from '../domain/types/rawGithub/RawGithubRepository'
import { RawGithubUser } from '../domain/types/rawGithub/RawGithubUser'
import { RawGithubEvent } from '../domain/types/rawGithub/RawGithubEvent'
import { GithubInstallation } from '../domain/types/GithubInstallation'
import { metrics } from '../util/metrics'
import { MetricUnit } from '@aws-lambda-powertools/metrics'

export interface GithubInstallationClient {
  listWorkflowRunsForRepo(owner: string, repo: string, created?: string): Promise<RawGithubWorkflowRunEvent[]>

  listOrganizationRepositories(org: string): Promise<RawGithubRepository[]>

  // Use when installation is for a personal user, not an organization
  listInstallationRepositories(): Promise<RawGithubRepository[]>

  listOrganizationMembers(org: string): Promise<RawGithubUser[]>

  listMostRecentEventsForRepo(owner: string, repo: string): Promise<RawGithubEvent[]>

  getUser(username: string): Promise<RawGithubUser>

  meta(): GithubInstallationClientMeta
}

export interface GithubInstallationClientMeta {
  // For now assuming all API calls are to the "core" resource, and so I don't differentiate
  // by x-ratelimit-used header (see https://docs.github.com/en/rest/rate-limit/rate-limit?apiVersion=2022-11-28#get-rate-limit-status-for-the-authenticated-user)
  readonly ratelimit: number
  readonly ratelimitUsed: number
  readonly ratelimitRemaining: number
  readonly ratelimitResetTimestamp: number
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
  const rateLimitData: {
    ratelimit: number
    ratelimitRemaining: number
    ratelimitUsed: number
    ratelimitResetTimestamp: number
  } = {
    ratelimit: 0,
    ratelimitRemaining: 0,
    ratelimitUsed: 0,
    ratelimitResetTimestamp: 0
  }

  function updateRateLimits(headers: OctokitResponseHeaders) {
    rateLimitData.ratelimit = Number(headers['x-ratelimit-limit'] ?? 0)
    rateLimitData.ratelimitRemaining = Number(headers['x-ratelimit-remaining'] ?? 0)
    rateLimitData.ratelimitUsed = Number(headers['x-ratelimit-used'] ?? 0)
    rateLimitData.ratelimitResetTimestamp = Number(headers['x-ratelimit-reset'] ?? 0)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function processOctokitIterator<T>(iterator: any) {
    const results: T[] = []
    for await (const response of iterator) {
      results.push(...response.data)
      updateRateLimits(response.headers)
    }
    return results
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function processOctokitResponse(response: any) {
    updateRateLimits(response.headers)
    return response.data
  }

  return {
    async listWorkflowRunsForRepo(owner: string, repo: string, created?: string) {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.actions.listWorkflowRunsForRepo, {
          owner,
          repo,
          created
        })
      )
    },
    // TOMaybe - consider other options here, e.g. type, sort
    async listOrganizationRepositories(org: string): Promise<RawGithubRepository[]> {
      return processOctokitIterator(octokit.paginate.iterator(octokit.repos.listForOrg, { org }))
    },
    async listInstallationRepositories(): Promise<RawGithubRepository[]> {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.apps.listReposAccessibleToInstallation, {})
      )
    },
    async listOrganizationMembers(org: string): Promise<RawGithubUser[]> {
      return processOctokitIterator(octokit.paginate.iterator(octokit.orgs.listMembers, { org }))
    },
    // For now, hard code page size to 10
    // GitHub doesn't retain these for long - so anything older than a few days won't be returned
    async listMostRecentEventsForRepo(owner: string, repo: string): Promise<RawGithubEvent[]> {
      return processOctokitResponse(await octokit.activity.listRepoEvents({ owner, repo, per_page: 10 }))
    },
    async getUser(username: string): Promise<RawGithubUser> {
      return processOctokitResponse(await octokit.users.getByUsername({ username }))
    },
    meta(): GithubInstallationClientMeta {
      return rateLimitData
    }
  }
}

export type OctokitResponseHeaders = {
  etag?: string
  'last-modified'?: string
  'x-ratelimit-limit'?: string
  'x-ratelimit-remaining'?: string
  'x-ratelimit-reset'?: string
  'x-ratelimit-used'?: string
}

// ToEventually - move this into the actual GithubInstallationClient object
export function publishGithubInstallationClientMetrics(
  installation: GithubInstallation,
  githubInstallationClient: GithubInstallationClient
) {
  const rateLimitMetric = metrics.singleMetric()
  rateLimitMetric.addDimension('installationAccount', installation.accountLogin)
  rateLimitMetric.addMetric(
    'githubRateLimitRemaining',
    MetricUnit.Count,
    githubInstallationClient.meta().ratelimitRemaining
  )
}
