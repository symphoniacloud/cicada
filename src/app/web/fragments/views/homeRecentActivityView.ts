import { fragmentViewResult } from '../../viewResultWrappers'
import { table, tbody, th, thead, tr } from '../../hiccough/hiccoughElements'
import { Clock } from '../../../util/dateAndTime'
import { pushRow } from '../../domainComponents/pushComponents'
import { GithubPush } from '../../../domain/types/GithubPush'

export function createHomeRecentActivityResponse(clock: Clock, recentPushes: GithubPush[]) {
  return fragmentViewResult(homeRecentActivityElement(clock, recentPushes))
}

export function homeRecentActivityElement(clock: Clock, recentPushes: GithubPush[]) {
  return table(
    { class: 'table' },
    thead(tr(...['Repo', 'Branch', 'When', 'By', 'Commit'].map((x) => th(x)))),
    tbody(...recentPushes.map((x) => pushRow(clock, x, { showRepo: true })))
  )
}
