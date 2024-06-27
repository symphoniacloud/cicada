// Modified version of https://github.com/CloudUnder/lambda-edge-nice-urls
// noinspection ES6ConvertVarToLetConst

// Using vars because CloudFront Functions' Javascript runtime doesn't support consts

// var manualRedirects = {
//   "/symphonia":"https://symphonia.io",
// }

// Change this if you want to use a different default object name
var defaultObject = 'index.html'

// See https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/writing-function-code.html
function handler(event) {
  var request = event.request
  var uri = request.uri

  // If the request matches an entry in our "manualRedirects" map, then REDIRECT to that
  // var manualRedirect = manualRedirects[uri];
  // if (manualRedirect)
  //   return createRedirect(manualRedirect);

  // For non-root directory requests ending in "/", then REDIRECT to same URI but without trailing slash
  // E.g. redirect https://coffeestorewebdemo.symphonia.io/foo/ to https://coffeestorewebdemo.symphonia.io/foo
  if (uri.match(/.+\/$/)) return createRedirect(uri.slice(0, -1))

  // CloudFront doesn't allow default objects other than at the root directory
  // So, if a path has no extension (and is not the root) then treat as a subdirectory and MODIFY REQUEST (**don't** redirect)
  // to add "/index.html" to end
  if (uri.match(/\/[^/.]+$/)) {
    request.uri = uri + '/' + defaultObject
    return request
  }

  // If nothing matches, return request unchanged
  return request
}

function createRedirect(location) {
  return {
    headers: {
      location: {
        value: location
      }
    },
    statusCode: 301,
    statusDescription: 'Moved Permanently'
  }
}
