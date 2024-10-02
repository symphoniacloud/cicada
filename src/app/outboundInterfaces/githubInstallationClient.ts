import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { RawGithubWorkflowRunEvent } from '../domain/types/rawGithub/RawGithubWorkflowRunEvent'
import { RawGithubRepo } from '../domain/types/rawGithub/RawGithubRepo'
import { RawGithubUser } from '../domain/types/rawGithub/RawGithubUser'
import { RawGithubEvent } from '../domain/types/rawGithub/RawGithubEvent'
import { metrics } from '../util/metrics'
import { MetricUnit } from '@aws-lambda-powertools/metrics'
import { failedWith, Result, successWith } from '../util/structuredResult'
import { GithubAppId, toRawGithubAppId } from '../domain/types/GithubAppId'
import { GithubInstallationId, toRawGithubInstallationId } from '../domain/types/GithubInstallationId'

export interface GithubInstallationClient {
  listWorkflowRunsForRepo(
    account: string,
    repo: string,
    created?: string
  ): Promise<RawGithubWorkflowRunEvent[]>

  listOrganizationRepositories(org: string): Promise<RawGithubRepo[]>

  // Use when installation is for a personal user, not an organization
  listInstallationRepositories(): Promise<RawGithubRepo[]>

  listPublicRepositoriesForUser(accountName: string): Promise<RawGithubRepo[]>

  listOrganizationMembers(org: string): Promise<RawGithubUser[]>

  listMostRecentEventsForRepo(account: string, repo: string): Promise<RawGithubEvent[]>

  getUser(username: string): Promise<Result<RawGithubUser>>

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
  appId: GithubAppId,
  privateKey: string,
  clientId: string,
  clientSecret: string,
  installationId: GithubInstallationId
): GithubInstallationClient {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: toRawGithubAppId(appId),
      privateKey,
      clientId,
      clientSecret,
      installationId: toRawGithubInstallationId(installationId)
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
    async listWorkflowRunsForRepo(account: string, repo: string, created?: string) {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.actions.listWorkflowRunsForRepo, {
          owner: account,
          repo,
          created
        })
      )
    },
    // TOMaybe - consider other options here, e.g. type, sort
    async listOrganizationRepositories(org: string): Promise<RawGithubRepo[]> {
      return processOctokitIterator(octokit.paginate.iterator(octokit.repos.listForOrg, { org }))
    },
    async listInstallationRepositories(): Promise<RawGithubRepo[]> {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.apps.listReposAccessibleToInstallation, {})
      )
    },
    async listPublicRepositoriesForUser(accountName: string): Promise<RawGithubRepo[]> {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.repos.listForUser, { username: accountName })
      )
    },
    async listOrganizationMembers(org: string): Promise<RawGithubUser[]> {
      return processOctokitIterator(octokit.paginate.iterator(octokit.orgs.listMembers, { org }))
    },
    // For now, hard code page size to 10
    // GitHub doesn't retain these for long - so anything older than a few days won't be returned
    async listMostRecentEventsForRepo(account: string, repo: string): Promise<RawGithubEvent[]> {
      return processOctokitResponse(
        await octokit.activity.listRepoEvents({ owner: account, repo, per_page: 10 })
      )
    },
    async getUser(username: string): Promise<Result<RawGithubUser>> {
      try {
        const octokitResponse = processOctokitResponse(await octokit.users.getByUsername({ username }))
        return successWith(octokitResponse)
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e?.status === 404) {
          return failedWith('Invalid username')
        } else {
          throw e
        }
      }
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
export function publishGithubInstallationClientMetrics(githubInstallationClient: GithubInstallationClient) {
  // Eventually considering adding "installation" as a dimension here to allow different metrics / alarms
  // for different installations. The reason I didn't just do that immediately is that, for now, Alarms
  // are defined at deployment time, but installations are a runtime concept.
  const rateLimitMetric = metrics.singleMetric()
  rateLimitMetric.addMetric(
    // ToEventually - this is a shared string with CDK so move to constant
    'githubRateLimitRemaining',
    MetricUnit.Count,
    githubInstallationClient.meta().ratelimitRemaining
  )
}
