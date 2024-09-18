import { HiccoughContent } from '../hiccough/hiccoughElement'
import { div } from '../hiccough/hiccoughElements'

export function divRow(...content: HiccoughContent[]) {
  return div({ class: 'row' }, ...content)
}

export function colSm(col: number, ...content: HiccoughContent[]) {
  return div({ class: `col-sm-${col}` }, ...content)
}

export function colAuto(...content: HiccoughContent[]) {
  return div({ class: `col-auto` }, ...content)
}
