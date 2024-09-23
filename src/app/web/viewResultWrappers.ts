import { a, body, div, head, htmlPage, link, meta, p, script, title } from './hiccough/hiccoughElements'
import { html } from './hiccough/hiccoughCore'
import { element, HiccoughContent } from './hiccough/hiccoughElement'
import { DOCTYPE_HTML5 } from './hiccough/hiccoughPage'
import { htmlOkResponse } from './htmlResponses'
import { adminPageRoute } from './pages/adminPage'

const hiccoughOptions = {
  newLines: true,
  eachIndent: '  '
}

export function fragmentViewResult(...bodyContent: HiccoughContent[]) {
  return htmlOkResponse(html(bodyContent, hiccoughOptions))
}

export function pageViewResponse(
  bodyContents: HiccoughContent[],
  options: { loggedIn?: boolean; title?: string } = {}
) {
  return htmlOkResponse(pageView(bodyContents, options))
}

export function pageView(
  bodyContents: HiccoughContent[],
  options: { loggedIn?: boolean; title?: string } = {}
) {
  return html(
    [
      DOCTYPE_HTML5,
      htmlPage(
        { lang: 'en' },
        head(
          meta({ charset: 'utf-8' }),
          meta({ 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }),
          meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
          title(options.title ?? 'Cicada'),
          script({ src: '/js/htmx.min.js', crossorigin: 'anonymous' }),
          link('stylesheet', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', {
            integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
            crossorigin: 'anonymous'
          }),
          link(
            'stylesheet',
            'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
          )
        ),
        body(
          div(
            { class: 'container', id: 'toplevel' },
            ...bodyContents,
            element('hr'),
            ...(options.loggedIn ?? true
              ? [
                  p(a('/', 'Back to home')),
                  p(a('/userSettings', 'User Settings')),
                  p(a(adminPageRoute.path, 'Global admin')),
                  p(a('/github/auth/logout', 'Logout'))
                ]
              : [p(a('/', 'Back to home'))])
          )
        )
      )
    ],
    hiccoughOptions
  )
}
