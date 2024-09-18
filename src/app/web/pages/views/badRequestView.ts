import { pageView } from '../../viewResultWrappers'
import { htmlResponse } from '../../htmlResponses'
import { h1, p } from '../../hiccough/hiccoughElements'

export function createBadRequestResponse(message: string) {
  return htmlResponse(400, pageView([h1({ class: 'display-3 mt-4' }, 'Cicada'), p(message)]))
}
