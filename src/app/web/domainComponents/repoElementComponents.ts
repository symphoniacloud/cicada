import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { inlineChildren, withOptions } from '../hiccough/hiccoughElement'
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
  return withOptions(
    inlineChildren,
    td(a(`/app/account/${ownerId}/repo/${repoId}`, repoName), '&nbsp;&nbsp;', githubAnchor(repoHtmlUrl))
  )
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
  return withOptions(
    inlineChildren,
    td(
      message.length < 40 ? message : `${message.substring(0, 40)}...`,
      '&nbsp;&nbsp;',
      githubAnchor(`${repoHtmlUrl ?? githubRepoUrl(event)}/commit/${sha}`)
    )
  )
}
