import { GithubRepositoryElement } from '../../domain/types/GithubElements'
import { a, td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function repoCell({
  accountId,
  repoId,
  repoName,
  repoHtmlUrl
}: GithubRepositoryElement & {
  repoHtmlUrl: string
}) {
  return td(a(`/repo?accountId=${accountId}&repoId=${repoId}`, repoName), '&nbsp;', githubAnchor(repoHtmlUrl))
}

export function githubRepoUrl({
  accountName,
  repoName
}: Pick<GithubRepositoryElement, 'accountName' | 'repoName'>) {
  return `https://github.com/${accountName}/${repoName}`
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
