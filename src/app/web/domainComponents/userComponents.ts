import { td, raw } from '@symphoniacloud/hiccough'
import { githubAnchor } from './genericComponents.js'

export function userCell(actor?: { userName: string }) {
  return actor === undefined
    ? td()
    : td(actor.userName, raw('&nbsp;'), githubAnchor(`https://github.com/${actor.userName}`))
}
