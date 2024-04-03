// This type is defined partly by the Octokit function actions.listWorkflowRunsForRepo,
// hence things here like fields that are possibly both undefined or null
// For now at least we use the same type here to represent runs events returned via the API **and** sent
// via webhook - that means some fields are missing here that exist in the API events, but not in webhook events
// This is a subset, but we can't infer full type using typescript

import { logger } from '../../../util/logging'

export interface RawGithubWorkflowRunEvent {
  id: number
  name?: string | null
  node_id: string
  head_branch: string | null
  head_sha: string
  path: string
  display_title: string
  run_number: number
  event: string
  status: string | null
  conclusion: string | null
  workflow_id: number
  html_url: string
  created_at: string
  updated_at: string
  run_attempt?: number
  run_started_at?: string
  actor?: { login: string; id: number; avatar_url: string; html_url: string }
  repository: {
    id: number
    node_id: string
    name: string
    html_url: string
    owner: {
      id: number
      login: string
      type: string
    }
  }
  // "workflow" is in webhook event but not API event
  workflow?: {
    id: number
    name: string
    html_url: string
    badge_url: string
  }
}

export function isRawGithubWorkflowRunEvent(x: unknown): x is RawGithubWorkflowRunEvent {
  const candidate = x as RawGithubWorkflowRunEvent
  const candidateIsValid =
    candidate.id !== undefined &&
    candidate.node_id !== undefined &&
    candidate.head_branch !== undefined &&
    candidate.head_sha !== undefined &&
    candidate.path !== undefined &&
    candidate.display_title !== undefined &&
    candidate.event !== undefined &&
    candidate.status !== undefined &&
    candidate.conclusion !== undefined &&
    candidate.workflow_id !== undefined &&
    candidate.html_url !== undefined &&
    candidate.created_at !== undefined &&
    candidate.updated_at !== undefined &&
    (candidate.actor === undefined ||
      (candidate.actor.login !== undefined &&
        candidate.actor.id !== undefined &&
        candidate.actor.avatar_url !== undefined &&
        candidate.actor.html_url !== undefined)) &&
    candidate.repository !== undefined &&
    candidate.repository.id !== undefined &&
    candidate.repository.node_id !== undefined &&
    candidate.repository.name !== undefined &&
    candidate.repository.html_url !== undefined &&
    candidate.repository.owner !== undefined &&
    candidate.repository.owner.id !== undefined &&
    candidate.repository.owner.login !== undefined &&
    candidate.repository.owner.type !== undefined &&
    (candidate.workflow === undefined ||
      (candidate.workflow.id !== undefined &&
        candidate.workflow.name !== undefined &&
        candidate.workflow.html_url !== undefined &&
        candidate.workflow.badge_url !== undefined))

  if (!candidateIsValid) {
    logger.error('Unexpected structure for RawGithubWorkflowRunEvent', { event: x })
  }
  return candidateIsValid
}
