// There's a lot more actually on here
export interface RawGithubInstallation {
  id: number
  account: {
    login: string
    id: number
  }
  target_type: string
  app_id: number
  app_slug: string
}
