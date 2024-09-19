import { RawGithubEvent } from '../../../src/app/domain/types/rawGithub/RawGithubEvent'
import { RawGithubRepository } from '../../../src/app/domain/types/rawGithub/RawGithubRepository'
import { RawGithubUser } from '../../../src/app/domain/types/rawGithub/RawGithubUser'
import { RawGithubWorkflowRunEvent } from '../../../src/app/domain/types/rawGithub/RawGithubWorkflowRunEvent'
import {
  GithubInstallationClient,
  GithubInstallationClientMeta
} from '../../../src/app/outboundInterfaces/githubInstallationClient'
import { arrayStubResponse } from './fakeSupport'

export class FakeGithubInstallationClient implements GithubInstallationClient {
  public stubOrganizationRepositories = arrayStubResponse<string, RawGithubRepository[]>()
  public stubInstallationRepositories: RawGithubRepository[] = []
  public stubOrganizationMembers = arrayStubResponse<string, RawGithubUser[]>()
  public stubUsers = arrayStubResponse<string, RawGithubUser>()

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

  async listOrganizationRepositories(org: string): Promise<RawGithubRepository[]> {
    return this.stubOrganizationRepositories.getResponseOrThrow(org)
  }

  async listInstallationRepositories(): Promise<RawGithubRepository[]> {
    return this.stubInstallationRepositories
  }

  async listOrganizationMembers(org: string): Promise<RawGithubUser[]> {
    return this.stubOrganizationMembers.getResponseOrThrow(org)
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

  async getUser(username: string): Promise<RawGithubUser> {
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
