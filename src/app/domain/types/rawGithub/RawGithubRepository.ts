export interface RawGithubRepository {
  id: number
  name: string
  full_name: string
  private: boolean
  owner: {
    id: number
    login: string
    type: string
  }
  html_url: string
  description: string | null
  fork: boolean
  url: string
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  archived: boolean
  disabled: boolean
  visibility: string
  default_branch: string
}
