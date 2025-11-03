import { GitHubWorkflowRunEvent, GitHubWorkflowSummary } from '../../ioTypes/GitHubTypes.js'
import { fromRawGithubUserId, fromRawGithubWorkflowRunId } from '../github/mappings/toFromRawGitHubIds.js'
import { narrowToWorkflowSummary } from '../github/githubWorkflow.js'
import { RawGithubWorkflowRunEvent } from '../../ioTypes/RawGitHubTypes.js'

// TOEventually - consider dateTimes, e.g. for Pushes we get localized times
export function fromRawGithubWorkflowRunEvent(
  workflow: GitHubWorkflowSummary,
  raw: RawGithubWorkflowRunEvent
): GitHubWorkflowRunEvent {
  return {
    ...narrowToWorkflowSummary(workflow),
    workflowRunId: fromRawGithubWorkflowRunId(raw.id),
    repoHtmlUrl: raw.repository.html_url,
    runNumber: raw.run_number,
    runAttempt: raw.run_attempt,
    event: raw.event,
    displayTitle: raw.display_title,
    runEventCreatedAt: raw.created_at,
    runEventUpdatedAt: raw.updated_at,
    runStartedAt: raw.run_started_at,
    status: raw.status ?? undefined,
    conclusion: raw.conclusion ?? undefined,
    headBranch: raw.head_branch ?? undefined,
    runHtmlUrl: raw.html_url,
    headSha: raw.head_sha,
    ...(raw.actor
      ? {
          actor: {
            userId: fromRawGithubUserId(raw.actor.id),
            userName: raw.actor.login,
            avatarUrl: raw.actor.avatar_url,
            htmlUrl: raw.actor.html_url
          }
        }
      : {})
  }
}
