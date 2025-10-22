import { expect, test } from 'vitest'
import { element, withAttributes, withOptions } from '../../../../../src/app/web/hiccough/hiccoughElement.js'
import { p } from '../../../../../src/app/web/hiccough/hiccoughElements.js'

test('element', () => {
  expect(element('p')).toEqual({
    isElement: true,
    name: 'p',
    content: []
  })
  expect(element('p', 'hello')).toEqual({
    isElement: true,
    name: 'p',
    content: ['hello']
  })
  expect(element('p', 'hello', 'world')).toEqual({
    isElement: true,
    name: 'p',
    content: ['hello', 'world']
  })
})

test('element with nesting', () => {
  expect(element('div', element('p', 'hello'))).toEqual({
    isElement: true,
    name: 'div',
    content: [
      {
        content: ['hello'],
        isElement: true,
        name: 'p'
      }
    ]
  })
  expect(element('div', element('p', 'hello'), element('p', 'world'))).toEqual({
    isElement: true,
    name: 'div',
    content: [
      {
        content: ['hello'],
        isElement: true,
        name: 'p'
      },
      {
        content: ['world'],
        isElement: true,
        name: 'p'
      }
    ]
  })
  expect(element('div', element('p', 'hello'), 'new', element('p', 'world'))).toEqual({
    isElement: true,
    name: 'div',
    content: [
      {
        content: ['hello'],
        isElement: true,
        name: 'p'
      },
      'new',
      {
        content: ['world'],
        isElement: true,
        name: 'p'
      }
    ]
  })
})

test('elementWithAttributes', () => {
  expect(element('p', { id: 'myTag' })).toEqual({
    isElement: true,
    name: 'p',
    attributes: { id: 'myTag' },
    content: []
  })
  expect(element('p', { id: 'myTag' }, 'hello')).toEqual({
    isElement: true,
    name: 'p',
    attributes: { id: 'myTag' },
    content: ['hello']
  })
  expect(element('p', { id: 'myTag' }, 'hello', 'world')).toEqual({
    isElement: true,
    name: 'p',
    attributes: { id: 'myTag' },
    content: ['hello', 'world']
  })
  expect(element('p', { id: 'myTag' }, 'hello', element('p', 'world'))).toEqual({
    isElement: true,
    name: 'p',
    attributes: { id: 'myTag' },
    content: [
      'hello',
      {
        content: ['world'],
        isElement: true,
        name: 'p'
      }
    ]
  })
})

test('with attributes', () => {
  expect(withAttributes({ class: 'myClass', id: 'pOne' }, p('Hello World'))).toEqual({
    isElement: true,
    name: 'p',
    attributes: {
      id: 'pOne',
      class: 'myClass'
    },
    content: ['Hello World']
  })
})

test('with options', () => {
  expect(withOptions({ newLines: true }, element('p'))).toEqual({
    isElement: true,
    name: 'p',
    content: [],
    options: {
      newLines: true
    }
  })
})
