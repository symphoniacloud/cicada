import { AppState } from '../../../environment/AppState.js'

export type WebhookProcessor = (appState: AppState, body: string) => Promise<void>
