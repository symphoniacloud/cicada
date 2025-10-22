import { fragmentViewResult } from '../../viewResultWrappers.js'
import { h3 } from '../../hiccough/hiccoughElements.js'
import { githubAnchor } from '../../domainComponents/genericComponents.js'
import { githubRepoUrl } from '../../domainComponents/repoElementComponents.js'
import { GithubRepoStructure } from '../../../domain/types/UserScopeReferenceData.js'

export function createRepoHeadingResponse(repo: GithubRepoStructure) {
  return fragmentViewResult(repoHeadingElement(repo))
}

export function repoHeadingElement(repo: GithubRepoStructure) {
  return h3(`Repository: ${repo.accountName}/${repo.repoName}`, `&nbsp;`, githubAnchor(githubRepoUrl(repo)))
}
