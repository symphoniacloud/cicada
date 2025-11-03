import {
  GithubInstallationClient,
  GithubInstallationClientMeta
} from '../../../src/app/outboundInterfaces/githubInstallationClient.js'
import { arrayStubResponse } from './fakeSupport.js'
import { Result } from '../../../src/app/util/structuredResult.js'
import {
  RawGithubEvent,
  RawGithubRepo,
  RawGithubUser,
  RawGithubWorkflow,
  RawGithubWorkflowRunEvent
} from '../../../src/app/ioTypes/RawGitHubTypes.js'

export class FakeGithubInstallationClient implements GithubInstallationClient {
  public stubOrganizationRepositories = arrayStubResponse<string, RawGithubRepo[]>()
  public stubInstallationRepositories: RawGithubRepo[] = []
  public stubPublicRepositoriesForUser = arrayStubResponse<string, RawGithubRepo[]>()
  public stubOrganizationMembers = arrayStubResponse<string, RawGithubUser[]>()
  public stubUsers = arrayStubResponse<string, Result<RawGithubUser>>()

  public stubWorkflowsForRepo = arrayStubResponse<
    {
      owner: string
      repo: string
    },
    RawGithubWorkflow[]
  >()
  public stubWorkflowRunsForRepo = arrayStubResponse<
    {
      owner: string
      repo: string
      created?: string | undefined
    },
    RawGithubWorkflowRunEvent[]
  >()
  public stubMostRecentEventsForRepo = arrayStubResponse<
    {
      owner: string
      repo: string
    },
    RawGithubEvent[]
  >()

  async listOrganizationRepositories(org: string): Promise<RawGithubRepo[]> {
    return this.stubOrganizationRepositories.getResponseOrThrow(org)
  }

  async listInstallationRepositories(): Promise<RawGithubRepo[]> {
    return this.stubInstallationRepositories
  }

  async listPublicRepositoriesForUser(accountName: string): Promise<RawGithubRepo[]> {
    return this.stubPublicRepositoriesForUser.getResponseOrThrow(accountName)
  }

  async listOrganizationMembers(org: string): Promise<RawGithubUser[]> {
    return this.stubOrganizationMembers.getResponseOrThrow(org)
  }

  async listWorkflowsForRepo(owner: string, repo: string): Promise<RawGithubWorkflow[]> {
    return this.stubWorkflowsForRepo.getResponseOrThrow({ owner, repo })
  }

  async listWorkflowRunsForRepo(
    owner: string,
    repo: string,
    created?: string | undefined
  ): Promise<RawGithubWorkflowRunEvent[]> {
    return this.stubWorkflowRunsForRepo.getResponseOrThrow({ owner, repo, created })
  }

  async listMostRecentEventsForRepo(owner: string, repo: string): Promise<RawGithubEvent[]> {
    return this.stubMostRecentEventsForRepo.getResponseOrThrow({ owner, repo })
  }

  async getUser(username: string): Promise<Result<RawGithubUser>> {
    return this.stubUsers.getResponseOrThrow(username)
  }

  // TOEventually - stub this if necessary
  meta(): GithubInstallationClientMeta {
    return {
      ratelimit: 0,
      ratelimitUsed: 0,
      ratelimitResetTimestamp: 0,
      ratelimitRemaining: 0
    }
  }
}
