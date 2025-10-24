import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GITHUB_WORKFLOW } from '../entityTypes.js'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GitHubAccountId, GitHubWorkflow, GitHubWorkflowKey } from '../../../types/GitHubTypes.js'
import { isGitHubWorkflow } from '../../../types/GitHubTypeChecks.js'

const GithubWorkflowEntity: CicadaEntity<
  GitHubWorkflow,
  Pick<GitHubWorkflow, 'accountId'>,
  Pick<GitHubWorkflow, 'repoId' | 'workflowId'>
> = {
  type: GITHUB_WORKFLOW,
  parse: typePredicateParser(isGitHubWorkflow, GITHUB_WORKFLOW),
  pk(source: Pick<GitHubWorkflow, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubWorkflow, 'repoId' | 'workflowId'>) {
    return `${skPrefix(source)}#WORKFLOW#${source.workflowId}`
  }
}

function skPrefix({ repoId }: Pick<GitHubWorkflow, 'repoId'>) {
  // We add #WORKFLOW_RUN_EVENT since in future we _might_ have workflow job events with similar structure
  return `REPO#${repoId}`
}

export async function putWorkflows(entityStore: AllEntitiesStore, workflows: GitHubWorkflow[]) {
  await store(entityStore).advancedOperations.batchPut(workflows)
  return workflows
}

export async function getWorkflow(entityStore: AllEntitiesStore, workflowKey: GitHubWorkflowKey) {
  return store(entityStore).getOrUndefined(workflowKey)
}

export async function getWorkflowsForAccount(entityStore: AllEntitiesStore, accountId: GitHubAccountId) {
  return store(entityStore).queryAllByPk({ accountId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubWorkflowEntity)
}
