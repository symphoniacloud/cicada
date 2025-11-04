import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { metrics } from '../util/metrics.js'
import { MetricUnit } from '@aws-lambda-powertools/metrics'
import { failedWith, isSuccess, Result, successWith } from '../util/structuredResult.js'
import { toRawGithubAppId, toRawGithubInstallationId } from '../domain/github/mappings/toFromRawGitHubIds.js'
import { GitHubAppId, GitHubInstallationId } from '../ioTypes/GitHubTypes.js'
import { z } from 'zod'
import { safeParseWithSchema } from '../ioTypes/zodUtil.js'

export interface GithubInstallationClient {
  listWorkflowRunsForRepo(account: string, repo: string, created?: string): Promise<unknown[]>

  listOrganizationRepositories(org: string): Promise<unknown[]>

  // Use when installation is for a personal user, not an organization
  listInstallationRepositories(): Promise<unknown[]>

  listPublicRepositoriesForUser(accountName: string): Promise<unknown[]>

  listOrganizationMembers(org: string): Promise<unknown[]>

  listWorkflowsForRepo(account: string, repo: string): Promise<unknown[]>

  listMostRecentEventsForRepo(account: string, repo: string): Promise<unknown[]>

  getUser(username: string): Promise<Result<unknown>>

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
  appId: GitHubAppId,
  privateKey: string,
  clientId: string,
  clientSecret: string,
  installationId: GitHubInstallationId
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
    function parse(x: unknown) {
      const parsed = safeParseWithSchema(z.coerce.number().default(0), x, 0, { logFailures: true })
      return isSuccess(parsed) ? parsed.result : parsed.failureResult
    }
    rateLimitData.ratelimit = parse(headers['x-ratelimit-limit'])
    rateLimitData.ratelimitRemaining = parse(headers['x-ratelimit-remaining'])
    rateLimitData.ratelimitUsed = parse(headers['x-ratelimit-used'])
    rateLimitData.ratelimitResetTimestamp = parse(headers['x-ratelimit-reset'])
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
    async listWorkflowsForRepo(account: string, repo: string) {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.actions.listRepoWorkflows, {
          owner: account,
          repo
        })
      )
    },
    // TOMaybe - consider other options here, e.g. type, sort
    async listOrganizationRepositories(org: string) {
      return processOctokitIterator(octokit.paginate.iterator(octokit.repos.listForOrg, { org }))
    },
    async listInstallationRepositories() {
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.apps.listReposAccessibleToInstallation, {})
      )
    },
    async listPublicRepositoriesForUser(accountName: string) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return processOctokitIterator(
        octokit.paginate.iterator(octokit.repos.listForUser, { username: accountName })
      )
    },
    async listOrganizationMembers(org: string) {
      return processOctokitIterator(octokit.paginate.iterator(octokit.orgs.listMembers, { org }))
    },
    // For now, hard code page size to 10
    // GitHub doesn't retain these for long - so anything older than a few days won't be returned
    async listMostRecentEventsForRepo(account: string, repo: string) {
      return processOctokitResponse(
        await octokit.activity.listRepoEvents({ owner: account, repo, per_page: 10 })
      )
    },
    async getUser(username: string) {
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
