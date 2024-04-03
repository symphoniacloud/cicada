import { AppState } from '../environment/AppState'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'

export type MinimalAPIGatewayProxyEvent = Pick<APIGatewayProxyEvent, 'path' | 'httpMethod'>

export type CicadaHandler<TEvent extends MinimalAPIGatewayProxyEvent> = (
  appState: AppState,
  event: TEvent
) => Promise<APIGatewayProxyResult>

export interface Route<TEvent extends MinimalAPIGatewayProxyEvent> {
  path: string
  target: CicadaHandler<TEvent>
  method?: 'GET' | 'POST' | 'DELETE'
}
