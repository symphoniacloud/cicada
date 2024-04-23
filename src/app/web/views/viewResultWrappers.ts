import { htmlOkResult } from '../../inboundInterfaces/httpResponses'

export function generateFragmentViewResult(bodyContents: string) {
  return htmlOkResult(`<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <meta http-equiv='X-UA-Compatible' content='IE=edge'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Cicada</title>
  <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css' integrity='sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu' crossorigin='anonymous'>
  <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'>
</head>
<body>
${bodyContents}
</body>
</html>`)
}

export function generatePageViewResultWithoutHtmx(bodyContents: string, loggedIn = true) {
  const footer = loggedIn
    ? `  <p><a href='web-push.html'>Manage Web Push Notifications</a></p>
  <p><a href='/'>Back to home</a></p>
  <p><a href='/github/auth/logout'>Logout</a></p>`
    : `  <p><a href='/'>Back to home</a></p>`

  return generateFragmentViewResult(`<div class='container' id='toplevel'>
  <h2>Cicada</h2>
${bodyContents}
  <hr />
${footer}
</div>`)
}
