import { GithubRepoSummary } from '../../domain/types/GithubSummaries.js'
import { a, td } from '../hiccough/hiccoughElements.js'
import { githubAnchor } from './genericComponents.js'

export function repoCell({
  accountId,
  repoId,
  repoName,
  repoHtmlUrl
}: GithubRepoSummary & {
  repoHtmlUrl: string
}) {
  return td(a(`/repo?accountId=${accountId}&repoId=${repoId}`, repoName), '&nbsp;', githubAnchor(repoHtmlUrl))
}

export function githubRepoUrl({
  accountName,
  repoName
}: Pick<GithubRepoSummary, 'accountName' | 'repoName'>) {
  return `https://github.com/${accountName}/${repoName}`
}

export function commitCell(
  event: GithubRepoSummary & {
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
