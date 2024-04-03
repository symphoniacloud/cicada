import { AppState } from '../../../environment/AppState'

export type WebhookProcessor = (appState: AppState, body: string) => Promise<void>
