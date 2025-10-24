import { a, td } from '../hiccough/hiccoughElements.js'
import { githubAnchor } from './genericComponents.js'
import { GitHubRepoSummary } from '../../ioTypes/GitHubTypes.js'

export function repoCell({
  accountId,
  repoId,
  repoName,
  repoHtmlUrl
}: GitHubRepoSummary & {
  repoHtmlUrl: string
}) {
  return td(a(`/repo?accountId=${accountId}&repoId=${repoId}`, repoName), '&nbsp;', githubAnchor(repoHtmlUrl))
}

export function githubRepoUrl({
  accountName,
  repoName
}: Pick<GitHubRepoSummary, 'accountName' | 'repoName'>) {
  return `https://github.com/${accountName}/${repoName}`
}

export function commitCell(
  event: GitHubRepoSummary & {
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
