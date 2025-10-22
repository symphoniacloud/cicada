import { element, HiccoughAttributes, HiccoughElementDefinition, withAttributes } from './hiccoughElement.js'

export function elementf(name: string) {
  return (...def: HiccoughElementDefinition) => element(name, ...def)
}

export const htmlPage = elementf('html')
export const head = elementf('head')
export const meta = elementf('meta')
export const script = elementf('script')
export const body = elementf('body')
export const h1 = elementf('h1')
export const h2 = elementf('h2')
export const h3 = elementf('h3')
export const h4 = elementf('h4')
export const table = elementf('table')
export const thead = elementf('thead')
export const tbody = elementf('tbody')
export const tr = elementf('tr')
export const th = elementf('th')
export const td = elementf('td')
export const p = elementf('p')
export const i = elementf('i')
export const b = elementf('b')
export const div = elementf('div')
export const form = elementf('form')
export const input = elementf('input')
export const label = elementf('label')
export const button = elementf('button')

export function title(content: string) {
  return element('title', content)
}

export function link(rel: string, href: string, attributes?: HiccoughAttributes) {
  return element('link', { rel, href, ...attributes })
}

export function a(href: string, ...def: HiccoughElementDefinition) {
  return withAttributes({ href }, element('a', ...def))
}
