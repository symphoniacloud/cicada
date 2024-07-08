import { GithubInstallation } from '../../../src/app/domain/types/GithubInstallation'
import { GithubUser } from '../../../src/app/domain/types/GithubUser'
import { GithubAccountMembership } from '../../../src/app/domain/types/GithubAccountMembership'
import { GithubRepository } from '../../../src/app/domain/types/GithubRepository'
import { GithubWorkflowRunEvent } from '../../../src/app/domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../../src/app/domain/types/GithubPush'
import { GithubUserToken } from '../../../src/app/domain/types/GithubUserToken'

export const testPersonalInstallation: GithubInstallation = {
  accountId: 162360409,
  accountLogin: 'cicada-test-user',
  accountType: 'user',
  appId: 849936,
  appSlug: 'cicada-test-personal',
  installationId: 48093071
}

export const testOrgInstallation: GithubInstallation = {
  accountId: 162483619,
  accountLogin: 'cicada-test-org',
  accountType: 'organization',
  appId: 850768,
  appSlug: 'cicada-test-org',
  installationId: 48133709
}

export const testTestUserTokenRecord: GithubUserToken = {
  token: 'validUserToken',
  userId: 162360409,
  userLogin: 'cicada-test-user',
  nextCheckTime: 1800000000
}

export const testTestUser: GithubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?v=4',
  htmlUrl: 'https://github.com/cicada-test-user',
  id: 162360409,
  login: 'cicada-test-user',
  url: 'https://api.github.com/users/cicada-test-user'
}

export const testMikeRobertsUser: GithubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
  htmlUrl: 'https://github.com/mikebroberts',
  id: 49635,
  login: 'mikebroberts',
  url: 'https://api.github.com/users/mikebroberts'
}

export const testTestUserMembershipOfPersonalInstallation: GithubAccountMembership = {
  accountId: 162360409,
  userId: 162360409
}

export const testTestUserMembershipOfOrg: GithubAccountMembership = {
  accountId: 162483619,
  userId: 162360409
}

export const testMikeRobertsUserMembershipOfOrg: GithubAccountMembership = {
  accountId: 162483619,
  userId: 49635
}

export const testPersonalTestRepo: GithubRepository = {
  archived: false,
  createdAt: '2024-03-05T17:56:33Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-user/personal-test-repo',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-user/personal-test-repo',
  id: 767679529,
  name: 'personal-test-repo',
  ownerId: 162360409,
  ownerName: 'cicada-test-user',
  ownerType: 'user',
  private: true,
  pushedAt: '2024-03-05T18:01:11Z',
  updatedAt: '2024-03-05T17:56:33Z',
  url: 'https://api.github.com/repos/cicada-test-user/personal-test-repo',
  visibility: 'private'
}

export const testOrgTestRepoOne: GithubRepository = {
  archived: false,
  createdAt: '2024-03-06T16:59:02Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-org/org-test-repo-one',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
  id: 768206479,
  name: 'org-test-repo-one',
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  private: true,
  pushedAt: '2024-03-06T17:00:38Z',
  updatedAt: '2024-03-06T16:59:02Z',
  url: 'https://api.github.com/repos/cicada-test-org/org-test-repo-one',
  visibility: 'private'
}

export const testOrgTestRepoTwo: GithubRepository = {
  archived: false,
  createdAt: '2024-03-06T17:01:02Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-org/org-test-repo-two',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-two',
  id: 768207426,
  name: 'org-test-repo-two',
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  private: true,
  pushedAt: '2024-03-06T17:02:13Z',
  updatedAt: '2024-03-06T17:01:03Z',
  url: 'https://api.github.com/repos/cicada-test-org/org-test-repo-two',
  visibility: 'private'
}

export const testPersonalTestRepoWorkflowRun: GithubWorkflowRunEvent = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?v=4',
    htmlUrl: 'https://github.com/cicada-test-user',
    id: 162360409,
    login: 'cicada-test-user'
  },
  conclusion: 'success',
  createdAt: '2024-03-05T18:01:24Z',
  displayTitle: 'Test Workflow',
  event: 'workflow_dispatch',
  headBranch: 'main',
  headSha: 'dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c',
  htmlUrl: 'https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530',
  id: 8160866530,
  ownerId: 162360409,
  ownerName: 'cicada-test-user',
  ownerType: 'user',
  path: '.github/workflows/test.yml',
  repoHtmlUrl: 'https://github.com/cicada-test-user/personal-test-repo',
  repoId: 767679529,
  repoName: 'personal-test-repo',
  runAttempt: 1,
  runNumber: 1,
  runStartedAt: '2024-03-05T18:01:24Z',
  status: 'completed',
  updatedAt: '2024-03-05T18:01:40Z',
  workflowBadgeUrl: undefined,
  workflowHtmlUrl: undefined,
  workflowId: 88508779,
  workflowName: 'Test Workflow'
}

export const testOrgTestRepoOneWorkflowRunOne: GithubWorkflowRunEvent = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts',
    id: 49635,
    login: 'mikebroberts'
  },
  conclusion: 'success',
  createdAt: '2024-03-06T17:02:42Z',
  displayTitle: 'Test Repo One Workflow',
  event: 'workflow_dispatch',
  headBranch: 'main',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8175883775',
  id: 8175883775,
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  path: '.github/workflows/test.yml',
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
  repoId: 768206479,
  repoName: 'org-test-repo-one',
  runAttempt: 1,
  runNumber: 1,
  runStartedAt: '2024-03-06T17:02:42Z',
  status: 'completed',
  updatedAt: '2024-03-06T17:02:54Z',
  workflowBadgeUrl: undefined,
  workflowHtmlUrl: undefined,
  workflowId: 88647110,
  workflowName: 'Test Repo One Workflow'
}

export const testOrgTestRepoOneWorkflowRunThree: GithubWorkflowRunEvent = {
  actor: {
    login: 'mikebroberts',
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts',
    id: 49635
  },
  conclusion: 'success',
  createdAt: '2024-03-06T19:25:32Z',
  displayTitle: 'Test Repo One Workflow',
  headBranch: 'main',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236',
  id: 8177622236,
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  repoId: 768206479,
  repoName: 'org-test-repo-one',
  runAttempt: 1,
  runNumber: 3,
  runStartedAt: '2024-03-06T19:25:32Z',
  status: 'completed',
  updatedAt: '2024-03-06T19:25:42Z',
  workflowBadgeUrl: undefined,
  workflowHtmlUrl: undefined,
  workflowId: 88647110,
  workflowName: 'Test Repo One Workflow',
  event: 'workflow_dispatch',
  path: '.github/workflows/test.yml',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}

export const testPersonalTestRepoPush: GithubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?',
    id: 162360409,
    login: 'cicada-test-user'
  },
  before: 'd6a1d5f977eb569d382e9cf4c90abf54ff2ce7ec',
  commits: [
    {
      author: {
        email: '162360409+cicada-test-user@users.noreply.github.com',
        name: 'cicada-test-user'
      },
      distinct: true,
      message: 'Minimal Github Workflow',
      sha: 'dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c'
    }
  ],
  dateTime: '2024-03-05T18:01:12Z',
  ownerId: 162360409,
  ownerName: 'cicada-test-user',
  ownerType: 'user',
  ref: 'refs/heads/main',
  repoId: 767679529,
  repoName: 'personal-test-repo'
}

export const testOrgTestRepoOnePush: GithubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?',
    id: 49635,
    login: 'mikebroberts'
  },
  before: '5fb00e703f342fd6e28a332c39456277936d71e5',
  commits: [
    {
      author: {
        email: 'mike@symphonia.io',
        name: 'Mike Roberts'
      },
      distinct: true,
      message: 'test workflow',
      sha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8'
    }
  ],
  dateTime: '2024-03-06T17:00:40Z',
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  ref: 'refs/heads/main',
  repoId: 768206479,
  repoName: 'org-test-repo-one'
}

export const testOrgTestRepoOnePushFC94: GithubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    id: 49635,
    login: 'mikebroberts'
  },
  before: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  commits: [
    {
      author: {
        email: 'mike@symphonia.io',
        name: 'Mike Roberts'
      },
      distinct: true,
      message: 'Update README.md',
      sha: 'fc94eb2b6feab026673ee6e740f3dd7fafd7c130'
    }
  ],
  dateTime: '2024-03-06T21:26:18.000Z',
  ownerId: 162483619,
  ownerName: 'cicada-test-org',
  ownerType: 'organization',
  ref: 'refs/heads/main',
  repoId: 768206479,
  repoName: 'org-test-repo-one',
  repoUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}
