import { AppState } from '../environment/AppState'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'

export type MinimalAPIGatewayProxyEvent = Pick<APIGatewayProxyEvent, 'path' | 'httpMethod'>

export type CicadaHandler<TEvent extends MinimalAPIGatewayProxyEvent, TAppState> = (
  appState: TAppState,
  event: TEvent
) => Promise<APIGatewayProxyResult>

// Most routes use the regular "AppState" type for app state, but others use a different type
export interface Route<TEvent extends MinimalAPIGatewayProxyEvent, TAppState = AppState> {
  path: string
  target: CicadaHandler<TEvent, TAppState>
  method?: 'GET' | 'POST' | 'DELETE'
}
