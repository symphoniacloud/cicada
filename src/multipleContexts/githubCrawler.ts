export const CRAWLABLE_RESOURCES = {
  INSTALLATIONS: 'installations',
  INSTALLATION: 'installation',
  PUBLIC_ACCOUNT: 'public_account'
} as const

export type CrawlableResource = (typeof CRAWLABLE_RESOURCES)[keyof typeof CRAWLABLE_RESOURCES]

export function isCrawlableResource(x: unknown): x is CrawlableResource {
  return typeof x === 'string' && Object.values(CRAWLABLE_RESOURCES).includes(x as CrawlableResource)
}
