import fs from 'node:fs'

export async function buildWebConfig(webPushPublicKey: string) {
  fs.writeFileSync('../../build/web/js/config.js', `export const VAPID_PUBLIC_KEY = '${webPushPublicKey}'`)
}
