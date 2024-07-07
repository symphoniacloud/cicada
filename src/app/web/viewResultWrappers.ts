import { a, body, div, h2, head, htmlPage, link, meta, p, title } from './hiccough/hiccoughElements'
import { html } from './hiccough/hiccoughCore'
import { element, HiccoughContent } from './hiccough/hiccoughElement'
import { DOCTYPE_HTML5 } from './hiccough/hiccoughPage'
import { htmlOkResponse } from './htmlResponses'

const hiccoughOptions = {
  newLines: true,
  eachIndent: '  '
}

export function fragmentViewResult(...bodyContent: HiccoughContent[]) {
  return htmlOkResponse(html(bodyContent, hiccoughOptions))
}

export function pageViewResultWithoutHtmx(bodyContents: HiccoughContent[], loggedIn = true) {
  return htmlOkResponseFor(
    div(
      { class: 'container', id: 'toplevel' },
      h2('Cicada'),
      ...bodyContents,
      element('hr'),
      ...(loggedIn
        ? [
            p(a('web-push.html', 'Manage Web Push Notifications')),
            p(a('/', 'Back to home')),
            p(a('/github/auth/logout', 'Logout'))
          ]
        : [p(a('/', 'Back to home'))])
    )
  )
}

function htmlOkResponseFor(...bodyContent: HiccoughContent[]) {
  return htmlOkResponse(
    html([DOCTYPE_HTML5, htmlPage({ lang: 'en' }, standardHead, body(...bodyContent))], hiccoughOptions)
  )
}

const standardHead = head(
  meta({ charset: 'utf-8' }),
  meta({ 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }),
  meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
  title('Cicada'),
  link('stylesheet', 'https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css', {
    integrity: 'sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu',
    crossorigin: 'anonymous'
  }),
  link('stylesheet', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css')
)
