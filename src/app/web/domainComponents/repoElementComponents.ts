import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { a, td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function repoCell({
  ownerId,
  repoId,
  repoName,
  repoHtmlUrl
}: GithubRepositoryElement & {
  repoHtmlUrl: string
}) {
  return td(a(`/app/account/${ownerId}/repo/${repoId}`, repoName), '&nbsp;', githubAnchor(repoHtmlUrl))
}

export function githubRepoUrl({
  ownerName,
  repoName
}: Pick<GithubRepositoryElement, 'ownerName' | 'repoName'>) {
  return `https://github.com/${ownerName}/${repoName}`
}

export function commitCell(
  event: GithubRepositoryElement & {
    message: string
    repoHtmlUrl?: string
    sha: string
  }
) {
  const { repoHtmlUrl, message, sha } = event
  return td(
    message.length < 40 ? message : `${message.substring(0, 40)}...`,
    '&nbsp;',
    githubAnchor(`${repoHtmlUrl ?? githubRepoUrl(event)}/commit/${sha}`)
  )
}
