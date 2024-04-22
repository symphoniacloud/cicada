import { AppState } from '../environment/AppState'
import { Route } from '../internalHttpRouter/internalHttpRoute'
import { createShowRepoResponse } from './views/showRepoView'
import { CicadaAuthorizedAPIEvent } from '../inboundInterfaces/lambdaTypes'
import { latestWorkflowRunEventsPerWorkflowForRepo } from '../domain/github/githubLatestWorkflowRunEvents'
import { getRecentActivityForRepo } from '../domain/github/githubActivity'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingPathParser } from '../schema/urlPathParser'
import { getRepository } from '../domain/github/githubRepository'
import { notFoundHTMLResponse } from '../inboundInterfaces/standardHttpResponses'
import { isFailure } from '../util/structuredResult'
import { logger } from '../util/logging'

export const showRepoRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/account(/:accountId)/repo(/:repoId)',
  target: showRepo
}

interface ShowRepoPathParams {
  accountId: string
  repoId: string
}

const showRepoPathSchema: JTDSchemaType<ShowRepoPathParams> = {
  properties: {
    accountId: { type: 'string' },
    repoId: { type: 'string' }
  }
}

const pathParser = validatingPathParser(showRepoRoute.path, showRepoPathSchema)

export async function showRepo(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parseResult = pathParser(event)
  if (isFailure(parseResult)) {
    logger.warn('Unexpected parse failure in showRepo', { reason: parseResult.reason })
    return notFoundHTMLResponse
  }
  const { accountId, repoId } = parseResult.result
  const { userId } = event
  // TOEventually - check user membership
  if (userId === 0) throw new Error()

  // TOEventually - figure out if can parse ints directly from path
  const accountIdNumber = parseInt(accountId)
  const repoIdNumber = parseInt(repoId)

  // TOEventually - do these three lookups in parallel?
  const repo = await getRepository(appState, accountIdNumber, repoIdNumber)
  if (!repo) {
    return notFoundHTMLResponse
  }

  const workflowStatus = await latestWorkflowRunEventsPerWorkflowForRepo(
    appState,
    accountIdNumber,
    repoIdNumber
  )
  const activity = await getRecentActivityForRepo(appState, accountIdNumber, repoIdNumber)

  return createShowRepoResponse(appState.clock, repo, workflowStatus, activity)
}
