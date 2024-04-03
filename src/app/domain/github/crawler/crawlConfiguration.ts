export interface CrawlConfiguration {
  crawlChildObjects: 'never' | 'ifChanged' | 'always'
  lookbackDays: number
}

export function calculateCrawlChildren(config: CrawlConfiguration, parentStateChanged: boolean) {
  return (
    config.crawlChildObjects === 'always' || (config.crawlChildObjects === 'ifChanged' && parentStateChanged)
  )
}
