import { pageView } from '../../viewResultWrappers.js'
import { htmlResponse } from '../../htmlResponses.js'
import { h1, p } from '@symphoniacloud/hiccough'

export function createBadRequestResponse(message: string) {
  return htmlResponse(400, pageView([h1({ class: 'display-3 mt-4' }, 'Cicada'), p(message)]))
}
