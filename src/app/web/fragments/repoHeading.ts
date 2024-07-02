import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../schema/urlPathParser'
import { isFailure } from '../../util/structuredResult'
import { logger } from '../../util/logging'
import { notFoundHTMLResponse } from '../../inboundInterfaces/standardHttpResponses'
import { getRepository } from '../../domain/github/githubRepository'
import { createRepoHeadingResponse } from './views/repoHeadingView'

export const repoHeadingRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/repo/heading',
  target: repoHeading
}

interface QueryStringParamaters {
  ownerId: string
  repoId: string
}

const schema: JTDSchemaType<QueryStringParamaters> = {
  properties: {
    ownerId: { type: 'string' },
    repoId: { type: 'string' }
  }
}

const qsParser = validatingQueryStringParser(schema)

export async function repoHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const { userId } = event
  // TOEventually - check user membership
  if (userId === 0) throw new Error()

  const parseResult = qsParser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Unexpected parse failure in repoHeading', { reason: parseResult.reason })
    return notFoundHTMLResponse
  }
  // TOEventually - figure out if can parse ints directly from query string
  const ownerIdNumber = parseInt(parseResult.result.ownerId)
  const repoIdNumber = parseInt(parseResult.result.repoId)

  const repo = await getRepository(appState, ownerIdNumber, repoIdNumber)
  if (!repo) {
    return notFoundHTMLResponse
  }

  return createRepoHeadingResponse(repo)
}
