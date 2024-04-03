import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubRepository, isGithubRepository } from '../../types/GithubRepository'
import { GITHUB_REPOSITORY } from '../entityTypes'

export const GithubRepositoryEntity: Entity<
  GithubRepository,
  Pick<GithubRepository, 'ownerId'>,
  Pick<GithubRepository, 'id'>
> = {
  type: GITHUB_REPOSITORY,
  parse: typePredicateParser(isGithubRepository, GITHUB_REPOSITORY),
  pk(source: Pick<GithubRepository, 'ownerId'>) {
    return `OWNER#${source.ownerId}`
  },
  sk(source: Pick<GithubRepository, 'id'>) {
    return `REPO#${source.id}`
  }
}
