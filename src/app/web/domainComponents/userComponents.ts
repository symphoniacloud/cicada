import { td } from '../hiccough/hiccoughElements'
import { githubAnchor } from './genericComponents'

export function userCell(actor?: { login: string }) {
  return actor === undefined
    ? td()
    : td(actor.login, `&nbsp;`, githubAnchor(`https://github.com/${actor.login}`))
}
