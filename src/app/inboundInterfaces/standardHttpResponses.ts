import { applicationJSONErrorAndLog } from './httpResponses'

// Function not constant because this logs
export function usernameFieldMissingFromContextResponse() {
  return applicationJSONErrorAndLog('username field missing from Lambda event')
}

// Function not constant because this logs
export function userIdFieldMissingFromContextResponse() {
  return applicationJSONErrorAndLog('userId field missing from Lambda event')
}
