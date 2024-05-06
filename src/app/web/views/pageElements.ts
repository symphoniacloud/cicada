import { GithubWorkflowRunEvent } from '../../domain/types/GithubWorkflowRunEvent'
import { GithubPush } from '../../domain/types/GithubPush'
import { Clock, displayDateTime } from '../../util/dateAndTime'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { latestCommitInPush } from '../../domain/github/githubPush'
import { a, td, tr } from '../hiccough/hiccoughElements'
import { inlineChildren, withOptions } from '../hiccough/hiccoughElement'

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
  return tr(
    { class: workflowRunClass(event) },
    showRepoCell ? repoCell(event) : undefined,
    showWorkflowCell ? workflowCell(event) : undefined,
    workflowResultCell(event),
    workflowRunCell(clock, event),
    userCell(event.actor),
    commitCellForWorkflowRunEvent(event)
  )
}

export function workflowRunClass(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  return event.conclusion === 'success' ? 'success' : 'danger'
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
  return withOptions(
    inlineChildren,
    td(a(`/app/account/${ownerId}/repo/${repoId}`, repoName), '&nbsp;&nbsp;', githubAnchor(repoHtmlUrl))
  )
}

export function workflowCell(
  event: GithubRepositoryElement &
    Pick<GithubWorkflowRunEvent, 'workflowHtmlUrl' | 'workflowId' | 'workflowName' | 'path'>
) {
  const workflowPath = `${event.path.substring(event.path.indexOf('/') + 1)}`
  return withOptions(
    inlineChildren,
    td(
      a(
        `/app/account/${event.ownerId}/repo/${event.repoId}/workflow/${event.workflowId}`,
        event.workflowName ?? workflowPath
      ),
      '&nbsp;&nbsp;',
      githubAnchor(event.workflowHtmlUrl ?? `${githubRepoUrl(event)}/actions/${workflowPath}`)
    )
  )
}

export function userCell(actor?: { login: string }) {
  return actor === undefined
    ? td()
    : withOptions(
        inlineChildren,
        td(actor.login, `&nbsp;&nbsp;`, githubAnchor(`https://github.com/${actor.login}`))
      )
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
  return withOptions(
    inlineChildren,
    td(
      message.length < 40 ? message : `${message.substring(0, 40)}...`,
      '&nbsp;&nbsp;',
      githubAnchor(`${repoHtmlUrl ?? githubRepoUrl(event)}/commit/${sha}`)
    )
  )
}

export function branchCell(push: GithubRepositoryElement & Pick<GithubPush, 'ref'>) {
  return withOptions(
    inlineChildren,
    td(
      push.ref.split('/')[2],
      `&nbsp;&nbsp;`,
      githubAnchor(`${githubRepoUrl(push)}/tree/${push.ref.split('/')[2]}`)
    )
  )
}

export function plainDateTimeCell(clock: Clock, { dateTime }: { dateTime: string }) {
  return td(displayDateTime(clock, dateTime))
}

export function workflowRunCell(clock: Clock, event: GithubWorkflowRunEvent) {
  return withOptions(
    inlineChildren,
    td(displayDateTime(clock, event.updatedAt), '&nbsp;&nbsp;', githubAnchor(event.htmlUrl))
  )
}

export function workflowResultCell(event: GithubWorkflowRunEvent) {
  // TOEventually - handle in progress
  return td(event.conclusion === 'success' ? 'Success' : 'Failed')
}

export function githubAnchor(target: string) {
  return a(target, githubIcon)
}

export const githubIcon = `<i class='bi bi-github' style='color: #6e5494'></i>`

export function githubRepoUrl({
  ownerName,
  repoName
}: Pick<GithubRepositoryElement, 'ownerName' | 'repoName'>) {
  return `https://github.com/${ownerName}/${repoName}`
}
