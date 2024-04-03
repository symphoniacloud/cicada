import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../domain/types/GithubPush'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { latestCommitInPush } from '../../domain/github/githubPush'

export function workflowRow(
  clock: Clock,
  event: GithubWorkflowRunEvent,
  {
    showRepoCell,
    showWorkflowCell
  }: {
    showRepoCell: boolean
    showWorkflowCell: boolean
  } = { showRepoCell: true, showWorkflowCell: true }
) {
  return `<tr ${workflowRunClass(event)}>
${showRepoCell ? `        ${repoCell(event)}` : ''}
${showWorkflowCell ? `        ${workflowCell(event)}` : ''}
        ${workflowResultCell(event)}
        ${workflowRunCell(clock, event)}
        ${userCell(event.actor)}
        ${commitCellForWorkflowRunEvent(event)}
      </tr>`
}

export function workflowRunClass(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  const isSuccessfulWorkflowRun = event.conclusion === 'success'
  return `class='${isSuccessfulWorkflowRun ? 'success' : 'danger'}'`
}

export function repoCellForPush(push: GithubPush) {
  return repoCell({ ...push, repoHtmlUrl: githubRepoUrl(push) })
}

export function repoCell({
  ownerId,
  repoId,
  repoName,
  repoHtmlUrl
}: GithubRepositoryElement & {
  repoHtmlUrl: string
}) {
  const cicadaRepoAnchor = anchor(`/app/account/${ownerId}/repo/${repoId}`, repoName)
  return cell(`${cicadaRepoAnchor}&nbsp;&nbsp;${githubAnchor(repoHtmlUrl)}`)
}

export function workflowCell(
  event: GithubRepositoryElement &
    Pick<GithubWorkflowRunEvent, 'workflowHtmlUrl' | 'workflowId' | 'workflowName' | 'path'>
) {
  const cicadaPath = `/app/account/${event.ownerId}/repo/${event.repoId}/workflow/${event.workflowId}`

  const workflowPath = `${event.path.substring(event.path.indexOf('/') + 1)}`,
    workflowName = event.workflowName ?? workflowPath
  const githubWorkflowUrl = event.workflowHtmlUrl ?? `${githubRepoUrl(event)}/actions/${workflowPath}`

  return cell(`${anchor(cicadaPath, workflowName)}&nbsp;&nbsp;${githubAnchor(githubWorkflowUrl)}`)
}

export function userCell(actor?: { login: string }) {
  return cell(actor ? `${actor.login}&nbsp;&nbsp;${githubAnchor(`https://github.com/${actor.login}`)}` : '')
}

export function commitCellForPush(push: GithubPush) {
  // Use the message of the **last** commit
  const commit = latestCommitInPush(push)
  return commitCell({
    ...push,
    message: commit.message,
    sha: commit.sha
  })
}

export function commitCellForWorkflowRunEvent(event: GithubWorkflowRunEvent) {
  return commitCell({
    ...event,
    sha: event.headSha,
    message: event.displayTitle
  })
}

export function commitCell(
  event: GithubRepositoryElement & {
    message: string
    repoHtmlUrl?: string
    sha: string
  }
) {
  const { repoHtmlUrl, message, sha } = event
  const commitUrl = `${repoHtmlUrl ?? githubRepoUrl(event)}/commit/${sha}`
  const commitMessage = message.length < 40 ? message : `${message.substring(0, 40)}...`
  return cell(`${commitMessage}&nbsp;&nbsp;${githubAnchor(commitUrl)}`)
}

export function branchCell(push: GithubRepositoryElement & Pick<GithubPush, 'ref'>) {
  const branchName = push.ref.split('/')[2]
  const githubUrlBranchForPush = `${githubRepoUrl(push)}/tree/${branchName}`
  return cell(`${branchName}&nbsp;&nbsp;${githubAnchor(githubUrlBranchForPush)}`)
}

export function plainDateTimeCell(clock: Clock, { dateTime }: { dateTime: string }) {
  return cell(displayDateTime(clock, dateTime))
}

export function workflowRunCell(clock: Clock, event: GithubWorkflowRunEvent) {
  return cell(`${displayDateTime(clock, event.updatedAt)}&nbsp;&nbsp;${githubAnchor(event.htmlUrl)}`)
}

export function workflowResultCell(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  return cell(event.conclusion === 'success' ? 'Success' : 'Failed')
}

export function githubAnchor(target: string) {
  return anchor(target, githubIcon)
}

export function cell(content: string) {
  return `<td>${content}</td>`
}

export function anchor(href: string, content: string) {
  return `<a href='${href}'>${content}</a>`
}

export const githubIcon = `<i class='bi bi-github' style='color: #6e5494'></i>`

export function githubRepoUrl({
  ownerName,
  repoName
}: Pick<GithubRepositoryElement, 'ownerName' | 'repoName'>) {
  return `https://github.com/${ownerName}/${repoName}`
}
