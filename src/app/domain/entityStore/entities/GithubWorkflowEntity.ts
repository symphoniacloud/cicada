import { CicadaEntity } from '../entityStoreEntitySupport'
import { GITHUB_WORKFLOW } from '../entityTypes'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubWorkflow, isGithubWorkflow } from '../../types/GithubWorkflow'
import { GithubWorkflowKey } from '../../types/GithubKeys'
import { GithubAccountId } from '../../types/GithubAccountId'

const GithubWorkflowEntity: CicadaEntity<
  GithubWorkflow,
  Pick<GithubWorkflow, 'accountId'>,
  Pick<GithubWorkflow, 'repoId' | 'workflowId'>
> = {
  type: GITHUB_WORKFLOW,
  parse: typePredicateParser(isGithubWorkflow, GITHUB_WORKFLOW),
  pk(source: Pick<GithubWorkflow, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubWorkflow, 'repoId' | 'workflowId'>) {
    return `${skPrefix(source)}#WORKFLOW#${source.workflowId}`
  }
}

function skPrefix({ repoId }: Pick<GithubWorkflow, 'repoId'>) {
  // We add #WORKFLOW_RUN_EVENT since in future we _might_ have workflow job events with similar structure
  return `REPO#${repoId}`
}

export async function putWorkflows(entityStore: AllEntitiesStore, workflows: GithubWorkflow[]) {
  await store(entityStore).advancedOperations.batchPut(workflows)
  return workflows
}

export async function getWorkflow(entityStore: AllEntitiesStore, workflowKey: GithubWorkflowKey) {
  return store(entityStore).getOrUndefined(workflowKey)
}

export async function getWorkflowsForAccount(entityStore: AllEntitiesStore, accountId: GithubAccountId) {
  return store(entityStore).queryAllByPk({ accountId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubWorkflowEntity)
}
