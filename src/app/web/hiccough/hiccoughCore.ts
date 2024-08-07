import { HiccoughContent, HiccoughElement, HiccoughOptions } from './hiccoughElement'
import { Mandatory } from '../../util/types'

export function html(input: HiccoughContent | HiccoughContent[], options: HiccoughOptions = {}): string {
  const fullOptions: InternalHiccoughOptions = {
    newLines: false,
    eachIndent: '  ',
    indentCount: -1,
    ...options
  }

  return renderContentArray(Array.isArray(input) ? input : [input], fullOptions).rendered
}

type InternalHiccoughOptions = Mandatory<HiccoughOptions, 'newLines' | 'indentCount' | 'eachIndent'>

function renderContentArray(content: HiccoughContent[], options: InternalHiccoughOptions) {
  const renderedElements = content
    .map((x) => renderContent(x, options))
    .filter((x) => x !== undefined) as RenderedContent[]

  return {
    rendered: renderedElements.map(({ rendered }) => rendered).join(`${options.newLines ? '\n' : ''}`),
    containsStructure: renderedElements.length > 1 || renderedElements.some(({ hasChildren }) => hasChildren)
  }
}

type RenderedContent = { rendered: string; hasChildren: boolean }

function renderContent(
  content: HiccoughContent,
  options: InternalHiccoughOptions
): RenderedContent | undefined {
  if (typeof content === 'undefined') return undefined
  if (typeof content === 'string') return { rendered: content, hasChildren: false }
  return {
    rendered: `${renderElement(content, {
      ...options,
      indentCount: options.indentCount + 1
    })}`,
    hasChildren: true
  }
}

function renderElement(input: HiccoughElement, parentOptions: InternalHiccoughOptions) {
  const options = { ...parentOptions, ...input.options }
  const childOptions = { ...options, ...{ indentFromParent: parentOptions.indentFromParent } }

  const { name, attributes, content } = input,
    { rendered, containsStructure } = renderContentArray(content ?? [], childOptions),
    preOpenIndentString =
      options.newLines || options.indentFromParent
        ? Array.from({ length: options.indentCount }, () => options.eachIndent).join('')
        : '',
    renderedAttributes = attributes
      ? ' ' +
        Object.entries(attributes)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ')
      : ''

  if (rendered.length === 0) {
    return `${preOpenIndentString}<${name}${renderedAttributes}></${name}>`
  }

  const newLineString = options.newLines && containsStructure ? '\n' : '',
    preCloseIndentString = options.newLines && containsStructure ? preOpenIndentString : ''

  return `${preOpenIndentString}<${name}${renderedAttributes}>${newLineString}${rendered}${newLineString}${preCloseIndentString}</${name}>`
}
