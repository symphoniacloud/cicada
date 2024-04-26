export const CRAWLABLE_RESOURCES = {
  INSTALLATIONS: 'installations',
  USERS: 'users',
  REPOSITORIES: 'repositories',
  PUSHES: 'pushes',
  WORKFLOW_RUN_EVENTS: 'workflowRunEvents'
} as const

export type CrawlableResource = (typeof CRAWLABLE_RESOURCES)[keyof typeof CRAWLABLE_RESOURCES]

export function isCrawlableResource(x: unknown): x is CrawlableResource {
  return typeof x === 'string' && Object.values(CRAWLABLE_RESOURCES).includes(x as CrawlableResource)
}
