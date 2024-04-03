import { RawGithubRepository } from './rawGithub/RawGithubRepository'
import { fromRawAccountType, GithubAccountType } from './githubCommonTypes'

export interface GithubRepository {
  id: number
  name: string
  fullName: string
  private: boolean
  ownerId: number
  ownerName: string
  ownerType: GithubAccountType
  htmlUrl: string
  description: string
  fork: boolean
  url: string
  createdAt: string
  updatedAt: string
  pushedAt: string
  homepage: string
  archived: boolean
  disabled: boolean
  visibility: string
  defaultBranch: string
}

export function isGithubRepository(x: unknown): x is GithubRepository {
  const candidate = x as GithubRepository
  return (
    candidate.id !== undefined &&
    candidate.name !== undefined &&
    candidate.fullName !== undefined &&
    candidate.private !== undefined &&
    candidate.ownerName !== undefined &&
    candidate.ownerId !== undefined &&
    candidate.htmlUrl !== undefined &&
    candidate.description !== undefined &&
    candidate.fork !== undefined &&
    candidate.url !== undefined &&
    candidate.createdAt !== undefined &&
    candidate.updatedAt !== undefined &&
    candidate.pushedAt !== undefined &&
    candidate.homepage !== undefined &&
    candidate.archived !== undefined &&
    candidate.disabled !== undefined &&
    candidate.visibility !== undefined &&
    candidate.defaultBranch !== undefined
  )
}

export function fromRawGithubRepository(raw: RawGithubRepository): GithubRepository {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    private: raw.private,
    ownerId: raw.owner.id,
    ownerName: raw.owner.login,
    ownerType: fromRawAccountType(raw.owner.type),
    htmlUrl: raw.html_url,
    description: raw.description ?? '',
    fork: raw.fork,
    url: raw.url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    homepage: raw.homepage ?? '',
    archived: raw.archived,
    disabled: raw.disabled,
    visibility: raw.visibility,
    defaultBranch: raw.default_branch
  }
}
