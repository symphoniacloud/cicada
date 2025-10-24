import { Clock, displayDateTime } from '../../util/dateAndTime.js'
import { td, tr } from '../hiccough/hiccoughElements.js'
import { latestCommitInPush } from '../../domain/github/githubPush.js'
import { commitCell, githubRepoUrl, repoCell } from './repoElementComponents.js'
import { userCell } from './userComponents.js'
import { githubAnchor } from './genericComponents.js'
import { GitHubPush, GitHubRepoSummary } from '../../ioTypes/GitHubTypes.js'

export type PushRowOptions = {
  showDescription: boolean
  showRepo: boolean
}

export function pushRow(clock: Clock, push: GitHubPush, options: PushRowOptions) {
  return tr(
    { class: 'table-light' },
    options.showDescription ? pushDescriptionCell : undefined,
    options.showRepo ? repoCellForPush(push) : undefined,
    branchCell(push),
    td(displayDateTime(clock, push.dateTime)),
    userCell(push.actor),
    commitCellForPush(push)
  )
}

const pushDescriptionCell = td('Push')

function repoCellForPush(push: GitHubPush) {
  return repoCell({ ...push, repoHtmlUrl: githubRepoUrl(push) })
}

function branchCell(push: GitHubRepoSummary & Pick<GitHubPush, 'ref'>) {
  const branchName = push.ref.split('/')[2]
  return td(branchName, `&nbsp;`, githubAnchor(`${githubRepoUrl(push)}/tree/${branchName}`))
}

function commitCellForPush(push: GitHubPush) {
  // Use the message of the **last** commit
  const commit = latestCommitInPush(push)
  return commitCell({
    ...push,
    message: commit.message,
    sha: commit.sha
  })
}
