import { GithubInstallation } from '../../../src/app/domain/types/GithubInstallation'
import { GithubUser } from '../../../src/app/domain/types/GithubUser'
import { GithubAccountMembership } from '../../../src/app/domain/types/GithubAccountMembership'
import { GithubRepo } from '../../../src/app/domain/types/GithubRepo'
import {
  FullGithubWorkflowRunEvent,
  GithubWorkflowRunEvent
} from '../../../src/app/domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../../src/app/domain/types/GithubPush'
import { GithubUserToken } from '../../../src/app/domain/types/GithubUserToken'
import { fromRawGithubAccountId } from '../../../src/app/domain/types/GithubAccountId'
import { fromRawGithubUserId, GithubUserId } from '../../../src/app/domain/types/GithubUserId'
import { fromRawGithubInstallationId } from '../../../src/app/domain/types/GithubInstallationId'
import { fromRawGithubRepoId } from '../../../src/app/domain/types/GithubRepoId'
import { fromRawGithubWorkflowId } from '../../../src/app/domain/types/GithubWorkflowId'
import { fromRawGithubWorkflowRunId } from '../../../src/app/domain/types/GithubWorkflowRunId'
import { GithubWorkflow } from '../../../src/app/domain/types/GithubWorkflow'
import { GithubAccountKey } from '../../../src/app/domain/types/GithubKeys'
import {
  GithubAccountSummary,
  GithubRepoSummary,
  GithubWorkflowSummary
} from '../../../src/app/domain/types/GithubSummaries'

export const cicadaTestUserAccountKey: GithubAccountKey = {
  accountId: fromRawGithubAccountId(162360409)
}

export const cicadaTestUserAccountSummary: GithubAccountSummary = {
  ...cicadaTestUserAccountKey,
  accountName: 'cicada-test-user',
  accountType: 'user'
}

export const cicadaTestOrgAccountSummary: GithubAccountSummary = {
  accountId: fromRawGithubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization'
}

export const cicadaTestUserInstallation: GithubInstallation = {
  ...cicadaTestUserAccountSummary,
  appId: 'GHApp849936',
  appSlug: 'cicada-test-personal',
  installationId: fromRawGithubInstallationId(48093071)
}

export const cicadaTestOrgInstallation: GithubInstallation = {
  ...cicadaTestOrgAccountSummary,
  appId: 'GHApp850768',
  appSlug: 'cicada-test-org',
  installationId: fromRawGithubInstallationId(48133709)
}

export const testTestUserTokenRecord: GithubUserToken = {
  token: 'validUserToken',
  userId: fromRawGithubUserId(162360409),
  userName: 'cicada-test-user',
  nextCheckTime: 1800000000
}

export const testTestUser: GithubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?v=4',
  htmlUrl: 'https://github.com/cicada-test-user',
  userId: fromRawGithubUserId(162360409),
  userName: 'cicada-test-user',
  url: 'https://api.github.com/users/cicada-test-user'
}

export const testMikeRobertsUser: GithubUser = {
  avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
  htmlUrl: 'https://github.com/mikebroberts',
  userId: fromRawGithubUserId(49635),
  userName: 'mikebroberts',
  url: 'https://api.github.com/users/mikebroberts'
}

export const testTestUserMembershipOfPersonalInstallation: GithubAccountMembership = {
  accountId: fromRawGithubAccountId(162360409),
  userId: fromRawGithubUserId(162360409)
}

export const testTestUserMembershipOfOrg: GithubAccountMembership = {
  accountId: fromRawGithubAccountId(162483619),
  userId: fromRawGithubUserId(162360409)
}

export const testMikeRobertsUserMembershipOfOrg: GithubAccountMembership = {
  accountId: fromRawGithubAccountId(162483619),
  userId: fromRawGithubUserId(49635)
}

export const accountMemberships: Record<GithubUserId, GithubAccountMembership> = {
  GHUser162360409: testTestUserMembershipOfOrg,
  GHUser49635: testMikeRobertsUserMembershipOfOrg
}

export const personalTestRepoSummary: GithubRepoSummary = {
  repoId: fromRawGithubRepoId(767679529),
  repoName: 'personal-test-repo',
  accountId: fromRawGithubAccountId(162360409),
  accountName: 'cicada-test-user',
  accountType: 'user'
}

export const testPersonalTestRepo: GithubRepo = {
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

export const orgTestRepoOneSummary: GithubRepoSummary = {
  ...cicadaTestOrgAccountSummary,
  repoId: fromRawGithubRepoId(768206479),
  repoName: 'org-test-repo-one'
}

export const orgTestRepoTwoSummary: GithubRepoSummary = {
  ...cicadaTestOrgAccountSummary,
  repoId: fromRawGithubRepoId(768207426),
  repoName: 'org-test-repo-two'
}

export const testOrgTestRepoOne: GithubRepo = {
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

export const testOrgTestRepoTwo: GithubRepo = {
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

export const testOrgTestWorkflowOneSummary: GithubWorkflowSummary = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGithubWorkflowId(88508779),
  workflowName: 'Test Workflow'
}

export const testOrgTestWorkflowOne: GithubWorkflow = {
  ...testOrgTestWorkflowOneSummary,
  workflowId: fromRawGithubWorkflowId(88508779),
  workflowName: 'Test Workflow',
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testOrgTestWorkflowOneFromJsonSummary: GithubWorkflowSummary = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGithubWorkflowId(88647110),
  workflowName: 'Test Repo One Workflow'
}

export const testOrgTestWorkflowOneFromJson: GithubWorkflow = {
  ...testOrgTestWorkflowOneFromJsonSummary,
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testOrgTestWorkflowOneFromJsonRun: GithubWorkflowRunEvent = {
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

export const personalTestRepoWorkflowSummary: GithubWorkflowSummary = {
  ...personalTestRepoSummary,
  workflowId: fromRawGithubWorkflowId(88508779),
  workflowName: 'Test Workflow'
}

export const personalTestRepoWorkflow: GithubWorkflow = {
  ...personalTestRepoWorkflowSummary,
  workflowState: 'active',
  workflowPath: '.github/workflows/test.yml',
  workflowUrl: 'NOTDEFINED',
  workflowHtmlUrl: 'https://github.com/cicada-test-user/personal-test-repo/actions/workflows/test.yml',
  workflowBadgeUrl: 'NOTDEFINED',
  workflowCreatedAt: '2024-03-05T18:01:24Z',
  workflowUpdatedAt: '2024-03-05T18:01:40Z'
}

export const testPersonalTestRepoWorkflowRun: GithubWorkflowRunEvent = {
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

export const fullTestPersonalTestRepoWorkflowRun: FullGithubWorkflowRunEvent = {
  ...personalTestRepoWorkflow,
  ...testPersonalTestRepoWorkflowRun
}

export const testOrgTestRepoOneWorkflowRunOne: GithubWorkflowRunEvent = {
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

export const testOrgTestRepoOneWorkflowFromJsonRunOne: GithubWorkflowRunEvent = {
  ...orgTestRepoOneSummary,
  workflowId: fromRawGithubWorkflowId(88647110),
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

export const fullTestOrgTestRepoOneWorkflowRunOne: FullGithubWorkflowRunEvent = {
  ...testOrgTestWorkflowOne,
  ...testOrgTestRepoOneWorkflowRunOne
}

export const testOrgTestRepoOneWorkflowRunThree: GithubWorkflowRunEvent = {
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

export const fullTestOrgTestRepoOneWorkflowRunThree: FullGithubWorkflowRunEvent = {
  ...testOrgTestWorkflowOne,
  ...testOrgTestRepoOneWorkflowRunThree
}

export const testPersonalTestRepoPush: GithubPush = {
  actor: {
    avatarUrl: 'https://avatars.githubusercontent.com/u/162360409?',
    userId: fromRawGithubUserId(162360409),
    userName: 'cicada-test-user'
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
  accountId: fromRawGithubAccountId(162360409),
  accountName: 'cicada-test-user',
  accountType: 'user',
  ref: 'refs/heads/main',
  repoId: fromRawGithubRepoId(767679529),
  repoName: 'personal-test-repo'
}

export const testOrgTestRepoOnePush: GithubPush = {
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
  accountId: fromRawGithubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization',
  ref: 'refs/heads/main',
  repoId: fromRawGithubRepoId(768206479),
  repoName: 'org-test-repo-one'
}

export const testOrgTestRepoOnePushFC94: GithubPush = {
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
  accountId: fromRawGithubAccountId(162483619),
  accountName: 'cicada-test-org',
  accountType: 'organization',
  ref: 'refs/heads/main',
  repoId: fromRawGithubRepoId(768206479),
  repoName: 'org-test-repo-one',
  repoUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
}
