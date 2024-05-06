export type HiccoughAttributes = Record<string, string>

export type HiccoughContent = string | HiccoughElement | undefined

export type HiccoughOptions = {
  newLines?: boolean
  indentFromParent?: boolean
  eachIndent?: string
  indentCount?: number
}

export type HiccoughElement = {
  isElement: true
  name: string
  attributes?: HiccoughAttributes
  content?: HiccoughContent[]
  options?: HiccoughOptions
}

function isHiccoughElement(x: unknown): x is HiccoughElement {
  return typeof x === 'object' && (x as HiccoughElement).isElement
}

function isHiccoughContent(x: unknown): x is HiccoughContent {
  const xtype = typeof x
  return xtype === 'undefined' || xtype === 'string' || isHiccoughElement(x)
}

export type HiccoughElementDefinition =
  | HiccoughContent[]
  | [HiccoughAttributes | HiccoughContent, ...HiccoughContent[]]

// First element of def can be either attributes or content
export function element(name: string, ...def: HiccoughElementDefinition): HiccoughElement {
  const baseElement: HiccoughElement = { isElement: true, name }
  const [first, ...rest] = def

  return isHiccoughContent(first)
    ? { ...baseElement, content: def as HiccoughContent[] }
    : {
        ...baseElement,
        attributes: first,
        content: rest as HiccoughContent[]
      }
}

export function withAttributes(attributes: HiccoughAttributes, element: HiccoughElement): HiccoughElement {
  return {
    ...element,
    attributes: {
      ...element.attributes,
      ...attributes
    }
  }
}

export function withOptions(options: HiccoughOptions, element: HiccoughElement): HiccoughElement {
  return {
    ...element,
    options
  }
}

export const inlineChildren: HiccoughOptions = {
  indentFromParent: true,
  newLines: false
}
