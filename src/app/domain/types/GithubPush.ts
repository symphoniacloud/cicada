import { logger } from '../../util/logging'
import { isRawGithubWebhookPush, RawGithubWebhookPushCommit } from './rawGithub/RawGithubWebhookPush'
import {
  RawGithubAPIPushEventEvent,
  RawGithubAPIPushEventEventCommit
} from './rawGithub/RawGithubAPIPushEventEvent'
import { fromRawAccountType } from './GithubAccountType'
import { NonEmptyArray } from '../../util/collections'
import { timestampToIso } from '../../util/dateAndTime'
import { fromRawGithubAccountId } from './GithubAccountId'
import { fromRawGithubUserId } from './GithubUserId'
import { fromRawGithubRepoId } from './GithubRepoId'
import { GithubRepoSummary, GithubUserSummary, isGithubRepoSummary } from './GithubSummaries'

// There's no consistent ID between pushes sourced from Webhooks vs Events, so use combination
// of owner, repo, ref, and first commit SHA to create a key
export interface GithubPush extends GithubRepoSummary {
  // Repo URL only available from Webhook Push, not API Push
  repoUrl?: string
  actor: GithubPushActor
  // dateTime isn't guaranteed to be consistent between pushes sourced from Webhooks vs Events
  dateTime: string
  ref: string
  before: string
  commits: NonEmptyArray<GithubPushCommit>
}

export interface GithubPushActor extends GithubUserSummary {
  avatarUrl: string
}

export interface GithubPushCommit {
  sha: string
  message: string
  distinct: boolean
  author?: {
    email?: string
    name?: string
  }
}

// TODO - tighten this up
export function isGithubPush(x: unknown): x is GithubPush {
  if (!isGithubRepoSummary(x)) return false

  const candidate = x as GithubPush
  return (
    candidate.actor !== undefined &&
    candidate.actor.userId !== undefined &&
    candidate.actor.userName !== undefined &&
    candidate.actor.avatarUrl !== undefined &&
    candidate.ref !== undefined &&
    candidate.before !== undefined &&
    candidate.commits !== undefined &&
    candidate.commits[0].sha !== undefined &&
    candidate.commits[0].message !== undefined &&
    candidate.commits[0].distinct !== undefined
  )
}

export function fromRawGithubWebhookPush(raw: unknown): GithubPush | undefined {
  if (!isRawGithubWebhookPush(raw)) {
    return undefined
  }

  return {
    accountId: fromRawGithubAccountId(raw.repository.owner.id),
    accountName: raw.repository.owner.name,
    accountType: fromRawAccountType(raw.repository.owner.type),
    repoId: fromRawGithubRepoId(raw.repository.id),
    repoName: raw.repository.name,
    repoUrl: raw.repository.html_url,
    actor: {
      userId: fromRawGithubUserId(raw.sender.id),
      userName: raw.sender.login,
      avatarUrl: raw.sender.avatar_url
    },
    // Use the datetime of the **LAST** commit for the date of this event
    dateTime: timestampToIso(raw.commits[raw.commits.length - 1].timestamp),
    ref: raw.ref,
    before: raw.before,
    commits: [
      // Explicitly include first element here to satisfy type
      fromRawGithubWebhookPushCommit(raw.commits[0]),
      ...raw.commits.slice(1).map(fromRawGithubWebhookPushCommit)
    ]
  }
}

function fromRawGithubWebhookPushCommit(commit: RawGithubWebhookPushCommit) {
  return {
    sha: commit.id,
    message: commit.message,
    distinct: commit.distinct,
    author: {
      name: commit.author.name,
      email: commit.author.email
    }
  }
}

export function fromRawGithubPushEventEvent(
  { accountId, accountName, repoName, repoId, accountType }: GithubRepoSummary,
  raw: RawGithubAPIPushEventEvent
): GithubPush | undefined {
  if (raw.payload.commits.length < 1) {
    logger.warn('RawGithubPushEventEvent with empty payload.commits array', { raw })
    return undefined
  }

  return {
    accountId,
    accountName,
    accountType,
    repoId,
    repoName,
    actor: {
      userId: fromRawGithubUserId(raw.actor.id),
      userName: raw.actor.login,
      avatarUrl: raw.actor.avatar_url
    },
    dateTime: raw.created_at,
    ref: raw.payload.ref,
    before: raw.payload.before,
    commits: [
      fromRawGithubPushEventEventCommit(raw.payload.commits[0]),
      ...raw.payload.commits.slice(1).map(fromRawGithubPushEventEventCommit)
    ]
  }
}

function fromRawGithubPushEventEventCommit(commit: RawGithubAPIPushEventEventCommit) {
  return {
    sha: commit.sha,
    message: commit.message,
    distinct: commit.distinct,
    author: {
      name: commit.author.name,
      email: commit.author.email
    }
  }
}
