import fs from 'node:fs'
import { getFromLocalEnv } from '../../multipleContexts/environmentVariables'

export async function buildWebConfig(env: NodeJS.ProcessEnv = process.env) {
  fs.writeFileSync(
    '../../build/web/js/config.js',
    `export const VAPID_PUBLIC_KEY = '${getFromLocalEnv('WEB_PUSH_VAPID_PUBLIC_KEY', env)}'`
  )
}