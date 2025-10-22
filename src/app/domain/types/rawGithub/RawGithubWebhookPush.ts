import { logger } from '../../../util/logging.js'

import { NonEmptyArray } from '../../../util/collections.js'

// Commented fields not currently captured
export interface RawGithubWebhookPush {
  ref: string
  before: string
  repository: {
    id: number
    name: string
    html_url: string
    owner: {
      name: string
      id: number
      type: string
      // login: string
      // node_id: string
      // avatar_url: string
      // html_url: string
    }
    // node_id: string
    // full_name: string
    // private: boolean
    // fork: boolean
    // visibility: boolean
    // master_branch: string
  }
  sender: {
    id: number
    login: string
    avatar_url: string
    // node_id: string
    // html_url: string
    // type: string
  }
  commits: NonEmptyArray<RawGithubWebhookPushCommit>
  // after: string
  // pusher: {
  //   name: string
  //   email: string
  // }
  // organization?: {
  //   id: number
  //   login: string
  //   node_id: string
  //   avatar_url: string
  // }
  // installation: {
  //   id: number
  //   node_id: string
  // }
  // created: boolean
  // deleted: boolean
  // forced: boolean
  // compare: string
  // head_commit: RawGithubWebhookPushCommit
}

export interface RawGithubWebhookPushCommit {
  id: string
  message: string
  distinct: boolean
  author: {
    email: string
    name: string
    username: string
  }
  // tree_id: string
  timestamp: string
  // committer: {
  //   name: string
  //   email: string
  //   username: string
  // }
  // added: string[]
  // removed: string[]
  // modified: string[]
}

export function isRawGithubWebhookPush(x: unknown): x is RawGithubWebhookPush {
  const candidate = x as RawGithubWebhookPush
  const candidateIsValid =
    candidate.ref !== undefined &&
    candidate.before !== undefined &&
    candidate.repository !== undefined &&
    candidate.repository.id !== undefined &&
    candidate.repository.name !== undefined &&
    candidate.repository.owner !== undefined &&
    candidate.repository.owner.name !== undefined &&
    candidate.repository.owner.id !== undefined &&
    candidate.repository.owner.type !== undefined &&
    candidate.repository.html_url !== undefined &&
    candidate.sender !== undefined &&
    candidate.sender.id !== undefined &&
    candidate.sender.login !== undefined &&
    candidate.sender.avatar_url !== undefined &&
    candidate.commits !== undefined &&
    candidate.commits.length > 0 &&
    candidate.commits.every(isRawGithubWebhookPushCommit)

  if (!candidateIsValid) {
    logger.error('Unexpected structure for RawGithubWebhookPush', { event: x })
  }
  return candidateIsValid
}

export function isRawGithubWebhookPushCommit(x: unknown): x is RawGithubWebhookPushCommit {
  const candidate = x as RawGithubWebhookPushCommit
  return (
    candidate !== undefined &&
    candidate.id !== undefined &&
    candidate.message !== undefined &&
    candidate.distinct !== undefined &&
    candidate.author !== undefined &&
    candidate.author.email !== undefined &&
    candidate.author.username !== undefined &&
    candidate.author.name !== undefined &&
    candidate.timestamp !== undefined
  )
}
