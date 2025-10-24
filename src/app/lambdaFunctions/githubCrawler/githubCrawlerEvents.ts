import { z } from 'zod'
import { CRAWLABLE_RESOURCES } from '../../../multipleContexts/githubCrawler.js'
import { GitHubAccountIdSchema, GitHubInstallationSchema } from '../../ioTypes/GitHubSchemas.js'

const CrawlInstallationsEventSchema = z.object({
  resourceType: z.literal(CRAWLABLE_RESOURCES.INSTALLATIONS)
})

const CrawlInstallationEventSchema = z.object({
  resourceType: z.literal(CRAWLABLE_RESOURCES.INSTALLATION),
  installation: GitHubInstallationSchema.unwrap(),
  lookbackDays: z.number()
})

const CrawlPublicAccountsEventSchema = z.object({
  resourceType: z.literal(CRAWLABLE_RESOURCES.PUBLIC_ACCOUNTS),
  lookbackHours: z.number()
})

const CrawlPublicAccountEventSchema = z.object({
  resourceType: z.literal(CRAWLABLE_RESOURCES.PUBLIC_ACCOUNT),
  installation: GitHubInstallationSchema.unwrap(),
  publicAccountId: GitHubAccountIdSchema.unwrap(),
  lookbackHours: z.number()
})

export const CrawlEventSchema = z.discriminatedUnion('resourceType', [
  CrawlInstallationsEventSchema,
  CrawlInstallationEventSchema,
  CrawlPublicAccountsEventSchema,
  CrawlPublicAccountEventSchema
])
