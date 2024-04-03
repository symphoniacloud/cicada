import { getFromLocalEnv } from '../multipleContexts/environmentVariables'

// Assumes that env vars from .env have already been loaded into environment

console.log(`${getFromLocalEnv('WEB_PARENT_DOMAIN_NAME')} ${getFromLocalEnv('WEB_PUSH_VAPID_PUBLIC_KEY')}`)
