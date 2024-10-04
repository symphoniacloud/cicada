import { fragmentViewResult } from '../../viewResultWrappers'
import { h3 } from '../../hiccough/hiccoughElements'
import { githubAnchor } from '../../domainComponents/genericComponents'
import { githubRepoUrl } from '../../domainComponents/repoElementComponents'
import { GithubRepoStructure } from '../../../domain/types/UserScopeReferenceData'

export function createRepoHeadingResponse(repo: GithubRepoStructure) {
  return fragmentViewResult(repoHeadingElement(repo))
}

export function repoHeadingElement(repo: GithubRepoStructure) {
  return h3(`Repository: ${repo.accountName}/${repo.repoName}`, `&nbsp;`, githubAnchor(githubRepoUrl(repo)))
}
