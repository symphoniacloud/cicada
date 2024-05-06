import { Clock, displayDateTime } from '../../util/dateAndTime'
import { GithubPush } from '../../domain/types/GithubPush'
import { td, tr } from '../hiccough/hiccoughElements'
import { latestCommitInPush } from '../../domain/github/githubPush'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { userCell } from './userComponents'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { githubAnchor } from './genericComponents'

export type PushRowOptions = {
  showDescription?: boolean
  showRepo?: boolean
}

export function pushRow(clock: Clock, push: GithubPush, options?: PushRowOptions) {
  const { showDescription, showRepo } = {
    showDescription: false,
    showRepo: false,
    ...options
  }

  const { dateTime }: { dateTime: string } = push
  return tr(
    { class: 'info' },
    showDescription ? pushDescriptionCell : undefined,
    showRepo ? repoCellForPush(push) : undefined,
    branchCell(push),
    td(displayDateTime(clock, dateTime)),
    userCell(push.actor),
    commitCellForPush(push)
  )
}

const pushDescriptionCell = td('Push')

function repoCellForPush(push: GithubPush) {
  return repoCell({ ...push, repoHtmlUrl: githubRepoUrl(push) })
}

function branchCell(push: GithubRepositoryElement & Pick<GithubPush, 'ref'>) {
  const branchName = push.ref.split('/')[2]
  return td(branchName, `&nbsp;`, githubAnchor(`${githubRepoUrl(push)}/tree/${branchName}`))
}

function commitCellForPush(push: GithubPush) {
  // Use the message of the **last** commit
  const commit = latestCommitInPush(push)
  return commitCell({
    ...push,
    message: commit.message,
    sha: commit.sha
  })
}
