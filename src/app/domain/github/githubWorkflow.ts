import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountElement, GithubRepositoryElement } from '../types/GithubElements'

export function getAccountsAndRepoElements(workflows: GithubWorkflow[]): {
  accounts: GithubAccountElement[]
  repos: GithubRepositoryElement[]
} {
  const accounts: GithubAccountElement[] = []
  const repos: GithubRepositoryElement[] = []

  // Oh, for a language with decent Sets, and overridable object equality :/
  workflows.forEach((workflow) => {
    if (!accounts.find((account) => account.ownerId === workflow.ownerId)) {
      accounts.push({
        ownerId: workflow.ownerId,
        ownerName: workflow.ownerName,
        ownerType: workflow.ownerType
      })
    }
    if (!repos.find((repo) => repo.ownerId === workflow.ownerId && repo.repoId === workflow.repoId)) {
      repos.push({
        ownerId: workflow.ownerId,
        ownerName: workflow.ownerName,
        ownerType: workflow.ownerType,
        repoId: workflow.repoId,
        repoName: workflow.repoName
      })
    }
  })

  return { accounts, repos }
}
