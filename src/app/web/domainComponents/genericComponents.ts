import { a, table, tbody, th, thead, tr } from '../hiccough/hiccoughElements.js'
import { HiccoughElement } from '../hiccough/hiccoughElement.js'

export function githubAnchor(target: string) {
  return a(target, `<i class='bi bi-github' style='color: #6e5494'></i>`)
}

export function standardTable(columnTitles: string[], rows: HiccoughElement[]) {
  return table({ class: 'table' }, theadFrom(columnTitles), tbody(...rows))
}

export function theadFrom(titles: string[]) {
  return thead(tr(...titles.map((x) => th(x))))
}
