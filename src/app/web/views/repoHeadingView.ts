import { fragmentViewResult } from './viewResultWrappers'
import { h3 } from '../hiccough/hiccoughElements'
import { githubAnchor } from '../domainComponents/genericComponents'
import { githubRepoUrl } from '../domainComponents/repoElementComponents'
import { GithubRepository } from '../../domain/types/GithubRepository'

export function createRepoHeadingResponse(repo: GithubRepository) {
  return fragmentViewResult(repoHeadingElement(repo))
}

export function repoHeadingElement(repo: GithubRepository) {
  return h3(
    `Repository: ${repo.ownerName}/${repo.name}`,
    `&nbsp;`,
    githubAnchor(
      githubRepoUrl({
        ...repo,
        repoName: repo.name
      })
    )
  )
}
