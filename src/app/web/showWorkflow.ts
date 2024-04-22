import { AppState } from '../environment/AppState'
import { Route } from '../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../inboundInterfaces/lambdaTypes'
import { getRunsForWorkflow } from '../domain/github/githubWorkflowRunEvent'
import { createShowWorkflowResponse } from './views/showWorkflowView'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingPathParser } from '../schema/urlPathParser'
import { isFailure } from '../util/structuredResult'
import { logger } from '../util/logging'
import { notFoundHTMLResponse } from '../inboundInterfaces/standardHttpResponses'

export const showWorkflowRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/account(/:accountId)/repo(/:repoId)/workflow(/:workflowId)',
  target: showWorkflow
}

interface ShowWorkflowPathParameters {
  accountId: string
  repoId: string
  workflowId: string
}

const showWorkflowPathSchema: JTDSchemaType<ShowWorkflowPathParameters> = {
  properties: {
    accountId: { type: 'string' },
    repoId: { type: 'string' },
    workflowId: { type: 'string' }
  }
}

const pathParser = validatingPathParser(showWorkflowRoute.path, showWorkflowPathSchema)

export async function showWorkflow(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parseResult = pathParser(event)
  if (isFailure(parseResult)) {
    logger.warn('Unexpected parse failure in showWorkflow', { reason: parseResult.reason })
    return notFoundHTMLResponse
  }
  const { accountId, repoId, workflowId } = parseResult.result
  const { userId } = event
  // TOEventually - check user membership
  if (userId === 0) throw new Error()

  // TOEventually - figure out if can parse ints directly from path
  const accountIdNumber = parseInt(accountId)
  const repoIdNumber = parseInt(repoId)
  const workflowIdNumber = parseInt(workflowId)

  // TOEventually - figure out if can parse ints directly from path
  const runs = await getRunsForWorkflow(appState, accountIdNumber, repoIdNumber, workflowIdNumber)

  return createShowWorkflowResponse(appState.clock, runs)
}
