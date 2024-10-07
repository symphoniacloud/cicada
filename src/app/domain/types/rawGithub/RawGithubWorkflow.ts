export interface RawGithubWorkflow {
  id: number
  node_id: string
  name: string
  path: string
  state: string // Can be [ "active", "deleted", "disabled_fork", "disabled_inactivity", "disabled_manually" ]
  created_at: string
  updated_at: string
  url: string
  html_url: string
  badge_url: string
}
