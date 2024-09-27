import { GITHUB_LATEST_PUSH_PER_REF } from '../entityTypes'
import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubPush, isGithubPush } from '../../types/GithubPush'

export const GithubLatestPushPerRefEntity: Entity<
  GithubPush,
  Pick<GithubPush, 'accountId'>,
  Pick<GithubPush, 'repoId' | 'ref'>
> = {
  type: GITHUB_LATEST_PUSH_PER_REF,
  parse: typePredicateParser(isGithubPush, GITHUB_LATEST_PUSH_PER_REF),
  pk(source: Pick<GithubPush, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubPush, 'repoId' | 'ref'>) {
    return `REPO#${source.repoId}#REF#${source.ref}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubPush, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubPush, 'dateTime'>) {
        return githubLatestPushPerRefGsiSk(source)
      }
    }
  }
}

export function githubLatestPushPerRefGsiSk({ dateTime }: Pick<GithubPush, 'dateTime'>) {
  return `DATETIME#${dateTime}`
}
