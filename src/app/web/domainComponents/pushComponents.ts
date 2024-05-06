import { Clock, displayDateTime } from '../../util/dateAndTime'
import { GithubPush } from '../../domain/types/GithubPush'
import { td, tr } from '../hiccough/hiccoughElements'
import { latestCommitInPush } from '../../domain/github/githubPush'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents'
import { userCell } from './userComponents'
import { GithubRepositoryElement } from '../../domain/types/GithubRepositoryElement'
import { inlineChildren, withOptions } from '../hiccough/hiccoughElement'
import { githubAnchor } from './genericComponents'

export type PushRowOptions = {
  showDescriptionCell?: boolean
  showRepoCell?: boolean
}

export function pushRow(clock: Clock, push: GithubPush, options?: PushRowOptions) {
  const { showDescriptionCell, showRepoCell } = {
    showDescriptionCell: false,
    showRepoCell: false,
    ...options
  }

  const { dateTime }: { dateTime: string } = push
  return tr(
    { class: 'info' },
    showDescriptionCell ? pushDescriptionCell : undefined,
    showRepoCell ? repoCellForPush(push) : undefined,
    branchCell(push),
    td(displayDateTime(clock, dateTime)),
    userCell(push.actor),
    commitCellForPush(push)
  )
}

const pushDescriptionCell = td('Push')

export function repoCellForPush(push: GithubPush) {
  return repoCell({ ...push, repoHtmlUrl: githubRepoUrl(push) })
}

function branchCell(push: GithubRepositoryElement & Pick<GithubPush, 'ref'>) {
  return withOptions(
    inlineChildren,
    td(
      push.ref.split('/')[2],
      `&nbsp;&nbsp;`,
      githubAnchor(`${githubRepoUrl(push)}/tree/${push.ref.split('/')[2]}`)
    )
  )
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
