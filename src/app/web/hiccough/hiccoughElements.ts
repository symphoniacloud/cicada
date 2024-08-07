import { element, HiccoughAttributes, HiccoughElementDefinition, withAttributes } from './hiccoughElement'

export function htmlPage(...def: HiccoughElementDefinition) {
  return element('html', ...def)
}

export function head(...def: HiccoughElementDefinition) {
  return element('head', ...def)
}

export function meta(...def: HiccoughElementDefinition) {
  return element('meta', ...def)
}

export function title(content: string) {
  return element('title', content)
}

export function link(rel: string, href: string, attributes?: HiccoughAttributes) {
  return element('link', { rel, href, ...attributes })
}

export function body(...def: HiccoughElementDefinition) {
  return element('body', ...def)
}

export function h1(...def: HiccoughElementDefinition) {
  return element('h1', ...def)
}

export function h2(...def: HiccoughElementDefinition) {
  return element('h2', ...def)
}

export function h3(...def: HiccoughElementDefinition) {
  return element('h3', ...def)
}

export function h4(...def: HiccoughElementDefinition) {
  return element('h4', ...def)
}

export function table(...def: HiccoughElementDefinition) {
  return element('table', ...def)
}

export function thead(...def: HiccoughElementDefinition) {
  return element('thead', ...def)
}

export function tbody(...def: HiccoughElementDefinition) {
  return element('tbody', ...def)
}

export function tr(...def: HiccoughElementDefinition) {
  return element('tr', ...def)
}

export function th(...def: HiccoughElementDefinition) {
  return element('th', ...def)
}

export function td(...def: HiccoughElementDefinition) {
  return element('td', ...def)
}

export function p(...def: HiccoughElementDefinition) {
  return element('p', ...def)
}

export function i(...def: HiccoughElementDefinition) {
  return element('i', ...def)
}

export function b(...def: HiccoughElementDefinition) {
  return element('b', ...def)
}

export function a(href: string, ...def: HiccoughElementDefinition) {
  return withAttributes({ href }, element('a', ...def))
}

export function div(...def: HiccoughElementDefinition) {
  return element('div', ...def)
}

export function input(...def: HiccoughElementDefinition) {
  return element('input', ...def)
}

export function label(...def: HiccoughElementDefinition) {
  return element('label', ...def)
}
