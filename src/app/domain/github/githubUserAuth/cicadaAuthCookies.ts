// Use two cookies because 'token' has HttpOnly set, and so isn't visible to client side javascript
import { Clock, dateTimeAddDays } from '../../../util/dateAndTime'

export function cookies(
  clock: Clock,
  webHostname: string,
  token: string,
  loggedIn: string,
  expiresInDays: number
) {
  // I use cookies to provide authorization data in requests from the browser to the client
  // This may seem "old school" but since Cicada uses a lot of dynamically generated HTML accessed via links
  // the only way of implementing this securely to logged-in users is to either use cookies,
  // or put login data on the links themselves, which is a terrible idea since they can easily be copied around,
  // exposing the user's access token
  // I actually use two cookies:
  // `token`, which has the user's actual token. It's marked "HttpOnly", and so can't be accessed by JavaScript in the
  // user's browser, which is better for security.
  // `loggedIn`, which is merely a flag. It isn't marked HttpOnly and so is used by browser-side Javascript
  // to discern whether the user is logged in, and provide the right UI accordingly
  // I set / unset both tokens at the same time to provide a good experience, while also securing the token.
  // In theory the user could manually delete / manipulate the cookies, but at the end of the day it's only
  // the token cookie that provides access to secure resources, and so they will only be downgrading their experience
  // if they manually change something
  // "Logout" is performed by setting the expiry date to the past for both cookies - when the browser
  // receives expired cookies it will delete them
  const expires = dateTimeAddDays(clock.now(), expiresInDays).toUTCString()
  return [
    `token=${token}; Secure; HttpOnly; SameSite=Lax; Domain=${webHostname}; Expires=${expires}; Path=/`,
    `loggedIn=${loggedIn}; Secure; SameSite=Lax; Domain=${webHostname}; Expires=${expires}; Path=/`
  ]
}
