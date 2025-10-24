import { RawGithubRepo } from './rawGithub/RawGithubRepo.js'
import { fromRawAccountType } from './GithubAccountType.js'
import { fromRawGitHubAccountId, fromRawGitHubRepoId } from './toFromRawGitHubIds.js'
import { GitHubRepoSummary } from '../../types/GitHubTypes.js'
import { isGitHubRepoSummary } from '../../types/GitHubTypeChecks.js'

export interface GithubRepo extends GitHubRepoSummary {
  fullName: string
  private: boolean
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

export function isGithubRepo(x: unknown): x is GithubRepo {
  const candidate = x as GithubRepo
  return (
    isGitHubRepoSummary(x) &&
    candidate.fullName !== undefined &&
    candidate.private !== undefined &&
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

export function fromRawGithubRepo(raw: RawGithubRepo): GithubRepo {
  return {
    accountId: fromRawGitHubAccountId(raw.owner.id),
    accountName: raw.owner.login,
    accountType: fromRawAccountType(raw.owner.type),
    repoId: fromRawGitHubRepoId(raw.id),
    repoName: raw.name,
    fullName: raw.full_name,
    private: raw.private,
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
