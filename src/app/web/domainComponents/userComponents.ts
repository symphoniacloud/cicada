import { td } from '../hiccough/hiccoughElements'
import { inlineChildren, withOptions } from '../hiccough/hiccoughElement'
import { githubAnchor } from './genericComponents'

export function userCell(actor?: { login: string }) {
  return actor === undefined
    ? td()
    : withOptions(
        inlineChildren,
        td(actor.login, `&nbsp;&nbsp;`, githubAnchor(`https://github.com/${actor.login}`))
      )
}
