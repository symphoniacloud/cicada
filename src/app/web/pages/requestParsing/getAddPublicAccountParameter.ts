import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { failedWith, Result, successWith } from '../../../util/structuredResult'
import { parse } from 'node:querystring'

export function getAddPublicAccountParameter(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountName: string }> {
  const parsed = parse(event.body ?? '')
  if ('accountName' in parsed && typeof parsed.accountName === 'string') {
    return successWith({ accountName: parsed.accountName })
  }

  return failedWith('Invalid post body - no accountName field')
}
