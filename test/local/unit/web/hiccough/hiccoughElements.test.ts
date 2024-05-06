import { expect, test } from 'vitest'
import { table, td, tr } from '../../../../../src/app/web/hiccough/hiccoughElements'

test('tables', () => {
  expect(table(tr(td('a'), td('b')))).toEqual({
    isElement: true,
    name: 'table',
    content: [
      {
        isElement: true,
        name: 'tr',
        content: [
          {
            isElement: true,
            name: 'td',
            content: ['a']
          },
          {
            isElement: true,
            name: 'td',
            content: ['b']
          }
        ]
      }
    ]
  })
})
