import { RawGithubEvent } from './RawGithubEvent.js'
import { logger } from '../../../util/logging.js'
import { isNotNullObject } from '../../../util/types.js'

// Commented fields not currently captured
export interface RawGithubAPIPushEventEvent extends RawGithubEvent {
  type: 'PushEvent'
  actor: {
    id: number
    login: string
    avatar_url: string
  }
  repo: {
    id: number
    name: string
  }
  created_at: string
  payload: {
    ref: string
    before: string
    commits: RawGithubAPIPushEventEventCommit[]
    // repository_id: number
    // push_id: number
    // size: number
    // distinct_size: number
    // head: string
  }
  // public: boolean
  // org?: {
  //   id: number
  //   login: string
  //   avatar_url: string
  // }
}

export interface RawGithubAPIPushEventEventCommit {
  sha: string
  message: string
  distinct: boolean
  author: {
    email: string
    name: string
  }
}

// TOEventually - better type checking across these two functions
export function hasTypeForPushEvent(x: unknown): x is { type: 'PushEvent' } {
  return isNotNullObject(x) && 'type' in x && x.type === 'PushEvent'
}

export function isRawGithubPushEventEvent(x: unknown): x is RawGithubAPIPushEventEvent {
  const candidate = x as RawGithubAPIPushEventEvent
  const candidateIsValid =
    candidate.type === 'PushEvent' &&
    candidate.actor !== undefined &&
    candidate.actor.id !== undefined &&
    candidate.actor.login !== undefined &&
    candidate.actor.avatar_url !== undefined &&
    candidate.repo !== undefined &&
    candidate.repo.id !== undefined &&
    candidate.repo.name !== undefined &&
    candidate.payload !== undefined &&
    candidate.payload.ref !== undefined &&
    candidate.payload.before !== undefined &&
    candidate.payload.commits !== undefined &&
    candidate.payload.commits.every(isRawGithubAPIPushEventEventCommit) &&
    candidate.created_at !== undefined

  if (!candidateIsValid) {
    logger.error('Unexpected structure for RawGithubAPIPushEventEvent', { event: x })
  }
  return candidateIsValid
}

export function isRawGithubAPIPushEventEventCommit(x: unknown): x is RawGithubAPIPushEventEventCommit {
  const candidate = x as RawGithubAPIPushEventEventCommit
  return (
    candidate !== undefined &&
    candidate.sha !== undefined &&
    candidate.message !== undefined &&
    candidate.distinct !== undefined &&
    candidate.author !== undefined &&
    candidate.author.email !== undefined &&
    candidate.author.name !== undefined
  )
}
