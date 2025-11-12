import {
  fromRawGitHubAccountId,
  fromRawGithubInstallationId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId,
  fromRawGithubWorkflowRunId
} from '../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import {
  GitHubAccountKey,
  GitHubAccountMembership,
  GitHubAccountSummary,
  GitHubInstallation,
  GitHubPush,
  GitHubRepo,
  GitHubRepoSummary,
  GitHubUser,
  GitHubUserId,
  GitHubUserToken,
  GitHubWorkflow,
  GitHubWorkflowRunEvent,
  GitHubWorkflowSummary
} from '../../../src/app/ioTypes/GitHubTypes.js'
import { FullGitHubWorkflowRunEvent } from '../../../src/app/domain/types/internalTypes.js'

export const cicadaTestUserAccountKey: GitHubAccountKey = {
  accountId: fromRawGitHubAccountId(162360409)
}

export const cicadaTestUserAccountSummary: GitHubAccountSummary = {
  ...cicadaTestUserAccountKey,
  accountName: 'cicada-test-user',
  accountType: 'user'
}

export const cicadaTestOrgAccountSummary: GitHubAccountSummary = {
  accountId: fromRawGitHubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization'
}

export const cicadaTestUserInstallation: GitHubInstallation = {
  ...cicadaTestUserAccountSummary,
  appId: 'GHApp849936',
  appSlug: 'cicada-test-personal',
  installationId: fromRawGithubInstallationId(48093071)
}

export const cicadaTestOrgInstallation: GitHubInstallation = {
  ...cicadaTestOrgAccountSummary,
  appId: 'GHApp850768',
  appSlug: 'cicada-test-org',
  installationId: fromRawGithubInstallationId(48133709)
}

export const testTestUserTokenRecord: GitHubUserToken = {
  token: 'validUserToken',
  userId: fromRawGithubUserId(162360409),
  userName: 'cicada-test-user',
  nextCheckTime: 1800000000
}

export const testTestUser: GitHubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?v=4',
  htmlUrl: 'https://github.com/cicada-test-user',
  userId: fromRawGithubUserId(162360409),
  userName: 'cicada-test-user',
  url: 'https://api.github.com/users/cicada-test-user'
}

export const testMikeRobertsUser: GitHubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
  htmlUrl: 'https://github.com/mikebroberts',
  userId: fromRawGithubUserId(49635),
  userName: 'mikebroberts',
  url: 'https://api.github.com/users/mikebroberts'
}

export const testTestUserMembershipOfPersonalInstallation: GitHubAccountMembership = {
  accountId: fromRawGitHubAccountId(162360409),
  userId: fromRawGithubUserId(162360409)
}

export const testTestUserMembershipOfOrg: GitHubAccountMembership = {
  accountId: fromRawGitHubAccountId(162483619),
  userId: fromRawGithubUserId(162360409)
}

export const testMikeRobertsUserMembershipOfOrg: GitHubAccountMembership = {
  accountId: fromRawGitHubAccountId(162483619),
  userId: fromRawGithubUserId(49635)
}

export const accountMemberships: Record<GitHubUserId, GitHubAccountMembership> = {
  GHUser162360409: testTestUserMembershipOfOrg,
  GHUser49635: testMikeRobertsUserMembershipOfOrg
}

export const personalTestRepoSummary: GitHubRepoSummary = {
  repoId: fromRawGitHubRepoId(767679529),
  repoName: 'personal-test-repo',
  accountId: fromRawGitHubAccountId(162360409),
  accountName: 'cicada-test-user',
  accountType: 'user'
}

export const testPersonalTestRepo: GitHubRepo = {
  ...personalTestRepoSummary,
  archived: false,
  createdAt: '2024-03-05T17:56:33Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-user/personal-test-repo',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-user/personal-test-repo',
  private: true,
  pushedAt: '2024-03-05T18:01:11Z',
  updatedAt: '2024-03-05T17:56:33Z',
  url: 'https://api.github.com/repos/cicada-test-user/personal-test-repo',
  visibility: 'private'
}

export const orgTestRepoOneSummary: GitHubRepoSummary = {
  ...cicadaTestOrgAccountSummary,
  repoId: fromRawGitHubRepoId(768206479),
  repoName: 'org-test-repo-one'
}

export const orgTestRepoTwoSummary: GitHubRepoSummary = {
  ...cicadaTestOrgAccountSummary,
  repoId: fromRawGitHubRepoId(768207426),
  repoName: 'org-test-repo-two'
}

export const testOrgTestRepoOne: GitHubRepo = {
  ...orgTestRepoOneSummary,
  archived: false,
  createdAt: '2024-03-06T16:59:02Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-org/org-test-repo-one',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
  private: true,
  pushedAt: '2024-03-06T17:00:38Z',
  updatedAt: '2024-03-06T16:59:02Z',
  url: 'https://api.github.com/repos/cicada-test-org/org-test-repo-one',
  visibility: 'private'
}

export const testOrgTestRepoTwo: GitHubRepo = {
  ...orgTestRepoTwoSummary,
  archived: false,
  createdAt: '2024-03-06T17:01:02Z',
  defaultBranch: 'main',
  description: '',
  disabled: false,
  fork: false,
  fullName: 'cicada-test-org/org-test-repo-two',
  homepage: '',
  htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-two',
  private: true,
  pushedAt: '2024-03-06T17:02:13Z',
  updatedAt: '2024-03-06T17:01:03Z',
  url: 'https://api.github.com/repos/cicada-test-org/org-test-repo-two',
  visibility: 'private'
}

export const testOrgTestWorkflowOneSummary: GitHubWorkflowSummary = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGitHubWorkflowId(88508779),
  workflowName: 'Test Workflow'
}

export const testOrgTestWorkflowOne: GitHubWorkflow = {
  ...testOrgTestWorkflowOneSummary,
  workflowId: fromRawGitHubWorkflowId(88508779),
  workflowName: 'Test Workflow',
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testOrgTestWorkflowOneFromJsonSummary: GitHubWorkflowSummary = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGitHubWorkflowId(88647110),
  workflowName: 'Test Repo One Workflow'
}

export const testOrgTestWorkflowOneFromJson: GitHubWorkflow = {
  ...testOrgTestWorkflowOneFromJsonSummary,
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testOrgTestWorkflowOneFromJsonRun: GitHubWorkflowRunEvent = {
  ...testOrgTestWorkflowOneFromJsonSummary,
  actor: {
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts',
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts'
  },
  conclusion: 'success',
  runEventCreatedAt: '2024-03-06T19:25:32Z',
  displayTitle: 'Test Repo One Workflow',
  headBranch: 'main',
  runHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236',
  workflowRunId: fromRawGithubWorkflowRunId(8177622236),
  runAttempt: 1,
  runNumber: 3,
  runStartedAt: '2024-03-06T19:25:32Z',
  status: 'completed',
  runEventUpdatedAt: '2024-03-06T19:25:42Z',
  event: 'workflow_dispatch',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}

export const personalTestRepoWorkflowSummary: GitHubWorkflowSummary = {
  ...personalTestRepoSummary,
  workflowId: fromRawGitHubWorkflowId(88508779),
  workflowName: 'Test Workflow'
}

export const personalTestRepoWorkflow: GitHubWorkflow = {
  ...personalTestRepoWorkflowSummary,
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testPersonalTestRepoWorkflowRun: GitHubWorkflowRunEvent = {
  ...personalTestRepoWorkflowSummary,
  actor: {
    userId: fromRawGithubUserId(162360409),
    userName: 'cicada-test-user',
    avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?v=4',
    htmlUrl: 'https://github.com/cicada-test-user'
  },
  conclusion: 'success',
  runEventCreatedAt: '2024-03-05T18:01:24Z',
  displayTitle: 'Test Workflow',
  event: 'workflow_dispatch',
  headBranch: 'main',
  headSha: 'dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c',
  runHtmlUrl: 'https://github.com/cicada-test-user/personal-test-repo/actions/runs/8160866530',
  workflowRunId: fromRawGithubWorkflowRunId(8160866530),
  repoHtmlUrl: 'https://github.com/cicada-test-user/personal-test-repo',
  runAttempt: 1,
  runNumber: 1,
  runStartedAt: '2024-03-05T18:01:24Z',
  status: 'completed',
  runEventUpdatedAt: '2024-03-05T18:01:40Z'
}

export const fullTestPersonalTestRepoWorkflowRun: FullGitHubWorkflowRunEvent = {
  ...personalTestRepoWorkflow,
  ...testPersonalTestRepoWorkflowRun
}

export const testOrgTestRepoOneWorkflowRunOne: GitHubWorkflowRunEvent = {
  ...testOrgTestWorkflowOneSummary,
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts',
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts'
  },
  conclusion: 'success',
  runEventCreatedAt: '2024-03-06T17:02:42Z',
  displayTitle: 'Test Repo One Workflow',
  event: 'workflow_dispatch',
  headBranch: 'main',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  runHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8175883775',
  workflowRunId: fromRawGithubWorkflowRunId(8175883775),
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
  runAttempt: 1,
  runNumber: 1,
  runStartedAt: '2024-03-06T17:02:42Z',
  status: 'completed',
  runEventUpdatedAt: '2024-03-06T17:02:54Z'
}

export const testOrgTestRepoOneWorkflowFromJsonRunOne: GitHubWorkflowRunEvent = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGitHubWorkflowId(88647110),
  workflowName: 'Test Repo One Workflow',
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts',
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts'
  },
  conclusion: 'success',
  runEventCreatedAt: '2024-03-06T17:02:42Z',
  displayTitle: 'Test Repo One Workflow',
  event: 'workflow_dispatch',
  headBranch: 'main',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  runHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8175883775',
  workflowRunId: fromRawGithubWorkflowRunId(8175883775),
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
  runAttempt: 1,
  runNumber: 1,
  runStartedAt: '2024-03-06T17:02:42Z',
  status: 'completed',
  runEventUpdatedAt: '2024-03-06T17:02:54Z'
}

export const fullTestOrgTestRepoOneWorkflowRunOne: FullGitHubWorkflowRunEvent = {
  ...testOrgTestWorkflowOne,
  ...testOrgTestRepoOneWorkflowRunOne
}

export const testOrgTestRepoOneWorkflowRunThree: GitHubWorkflowRunEvent = {
  ...testOrgTestWorkflowOneSummary,
  actor: {
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts',
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    htmlUrl: 'https://github.com/mikebroberts'
  },
  conclusion: 'success',
  runEventCreatedAt: '2024-03-06T19:25:32Z',
  displayTitle: 'Test Repo One Workflow',
  headBranch: 'main',
  runHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236',
  workflowRunId: fromRawGithubWorkflowRunId(8177622236),
  runAttempt: 1,
  runNumber: 3,
  runStartedAt: '2024-03-06T19:25:32Z',
  status: 'completed',
  runEventUpdatedAt: '2024-03-06T19:25:42Z',
  event: 'workflow_dispatch',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}

export const fullTestOrgTestRepoOneWorkflowRunThree: FullGitHubWorkflowRunEvent = {
  ...testOrgTestWorkflowOne,
  ...testOrgTestRepoOneWorkflowRunThree
}

export const testPersonalTestRepoPush: GitHubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?',
    userId: fromRawGithubUserId(162360409),
    userName: 'cicada-test-user'
  },
  before: 'd6a1d5f977eb569d382e9cf4c90abf54ff2ce7ec',
  commits: [],
  dateTime: '2024-03-05T18:01:12Z',
  accountId: fromRawGitHubAccountId(162360409),
  accountName: 'cicada-test-user',
  accountType: 'user',
  ref: 'refs/heads/main',
  headSha: 'dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c',
  repoId: fromRawGitHubRepoId(767679529),
  repoName: 'personal-test-repo'
}

export const testOrgTestRepoOnePush: GitHubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?',
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts'
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
  accountId: fromRawGitHubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization',
  ref: 'refs/heads/main',
  headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
  repoId: fromRawGitHubRepoId(768206479),
  repoName: 'org-test-repo-one'
}

export const testOrgTestRepoOnePushTwo: GitHubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?',
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts'
  },
  before: 'c154d038b2f763ce26e0301cef5f0030c8b0e75e',
  commits: [],
  dateTime: '2025-11-09T20:48:34Z',
  accountId: fromRawGitHubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization',
  ref: 'refs/heads/main',
  headSha: 'a101cadd1f1c116ec5ade7713bc895a505151eda',
  repoId: fromRawGitHubRepoId(768206479),
  repoName: 'org-test-repo-one'
}

export const testOrgTestRepoOnePushFC94: GitHubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
    userId: fromRawGithubUserId(49635),
    userName: 'mikebroberts'
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
  accountId: fromRawGitHubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization',
  ref: 'refs/heads/main',
  headSha: 'fc94eb2b6feab026673ee6e740f3dd7fafd7c130',
  repoId: fromRawGitHubRepoId(768206479),
  repoName: 'org-test-repo-one',
  repoUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}
