import { expect, test } from 'vitest'
import { html } from '../../../../../src/app/web/hiccough/hiccoughCore.js'
import {
  a,
  body,
  div,
  h1,
  head,
  htmlPage,
  p,
  table,
  td,
  title,
  tr
} from '../../../../../src/app/web/hiccough/hiccoughElements.js'
import { element, withOptions } from '../../../../../src/app/web/hiccough/hiccoughElement.js'
import { DOCTYPE_HTML5 } from '../../../../../src/app/web/hiccough/hiccoughPage.js'

test('hiccough smoke test', () => {
  expect(
    html(
      [
        DOCTYPE_HTML5,
        htmlPage(
          { lang: 'en' },
          head(title('Hiccough Test')),
          body(div({ id: 'top' }, h1('Hello'), table(tr(...['a', 'b', 'c'].map((x) => td(x))))))
        )
      ],
      {
        newLines: true,
        eachIndent: '  '
      }
    )
  ).toEqual(`<!doctype html>
<html lang="en">
  <head>
    <title>Hiccough Test</title>
  </head>
  <body>
    <div id="top">
      <h1>Hello</h1>
      <table>
        <tr>
          <td>a</td>
          <td>b</td>
          <td>c</td>
        </tr>
      </table>
    </div>
  </body>
</html>`)
})

test('hiccough', () => {
  expect(html(element('span'))).toEqual(`<span></span>`)
  expect(html(element('span', 'bar'))).toEqual(`<span>bar</span>`)
  expect(html(element('span', 'bar', '&nbsp;baz'))).toEqual(`<span>bar&nbsp;baz</span>`)

  expect(html(element('span', { class: 'foo' }))).toEqual(`<span class="foo"></span>`)
  expect(html(element('span', { class: 'foo' }, 'bar'))).toEqual(`<span class="foo">bar</span>`)
  expect(html(element('span', { class: 'foo' }, '\nbar', '\nbaz'))).toEqual(`<span class="foo">
bar
baz</span>`)

  expect(html(tr(td('a')))).toEqual(`<tr><td>a</td></tr>`)
  expect(html(tr(td('a'), td('b')))).toEqual(`<tr><td>a</td><td>b</td></tr>`)
  expect(html(table(tr(td('a'), td('b'))))).toEqual(`<table><tr><td>a</td><td>b</td></tr></table>`)
  expect(html(table({ class: 'table' }, tr(...['a', 'b', 'c'].map((x) => td(x)))))).toEqual(
    `<table class="table"><tr><td>a</td><td>b</td><td>c</td></tr></table>`
  )

  expect(html(div(p('Hello'), p('World')))).toEqual(`<div><p>Hello</p><p>World</p></div>`)
  expect(html(div(...[p('Hello'), p('World')]))).toEqual(`<div><p>Hello</p><p>World</p></div>`)
  expect(html(p(undefined, 'Hello', undefined, 'World'))).toEqual(`<p>HelloWorld</p>`)

  expect(html([p('Hello'), p('World')])).toEqual(`<p>Hello</p><p>World</p>`)
})

test('hiccough with options', () => {
  const indentAndNewLine = {
    eachIndent: '  ',
    newLines: true
  }

  expect(html(element('span', { class: 'foo' }, 'bar'), indentAndNewLine)).toEqual(
    `<span class="foo">bar</span>`
  )

  expect(html(div({ class: 'foo' }, p('Hello'), p('World')), indentAndNewLine)).toEqual(`<div class="foo">
  <p>Hello</p>
  <p>World</p>
</div>`)

  expect(html(p('Hello', 'World', 'Again'), indentAndNewLine)).toEqual(`<p>
Hello
World
Again
</p>`)

  expect(html(table(tr(td('a'), td('b'))), indentAndNewLine)).toEqual(`<table>
  <tr>
    <td>a</td>
    <td>b</td>
  </tr>
</table>`)

  expect(html(table(tr(undefined, td('a'), undefined, td('b'), undefined)), indentAndNewLine))
    .toEqual(`<table>
  <tr>
    <td>a</td>
    <td>b</td>
  </tr>
</table>`)

  expect(
    html(
      table(
        withOptions(
          {
            newLines: false,
            indentFromParent: true
          },
          tr(td('a'), td('b'))
        )
      ),
      indentAndNewLine
    )
  ).toEqual(`<table>
  <tr><td>a</td><td>b</td></tr>
</table>`)

  expect(
    html(
      div(p('Hello', 'World', a('https://example.com', 'example')), p('Hello'), p('World')),
      indentAndNewLine
    )
  ).toEqual(`<div>
  <p>
Hello
World
    <a href="https://example.com">example</a>
  </p>
  <p>Hello</p>
  <p>World</p>
</div>`)

  expect(
    html(
      div(
        withOptions(
          {
            newLines: false,
            indentFromParent: true
          },
          p('Hello', 'World', a('https://example.com', 'example'))
        ),
        p('Hello'),
        p('World')
      ),
      indentAndNewLine
    )
  ).toEqual(`<div>
  <p>HelloWorld<a href="https://example.com">example</a></p>
  <p>Hello</p>
  <p>World</p>
</div>`)
})
