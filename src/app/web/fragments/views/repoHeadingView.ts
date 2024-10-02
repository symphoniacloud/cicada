import { fragmentViewResult } from '../../viewResultWrappers'
import { h3 } from '../../hiccough/hiccoughElements'
import { githubAnchor } from '../../domainComponents/genericComponents'
import { githubRepoUrl } from '../../domainComponents/repoElementComponents'
import { GithubRepo } from '../../../domain/types/GithubRepo'

export function createRepoHeadingResponse(repo: GithubRepo) {
  return fragmentViewResult(repoHeadingElement(repo))
}

export function repoHeadingElement(repo: GithubRepo) {
  return h3(`Repository: ${repo.accountName}/${repo.repoName}`, `&nbsp;`, githubAnchor(githubRepoUrl(repo)))
}
