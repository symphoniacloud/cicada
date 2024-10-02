import { td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function userCell(actor?: { userName: string }) {
  return actor === undefined
    ? td()
    : td(actor.userName, `&nbsp;`, githubAnchor(`https://github.com/${actor.userName}`))
}
