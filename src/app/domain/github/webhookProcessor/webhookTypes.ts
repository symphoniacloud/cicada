export const INSTALLATION_WEBHOOK_TYPE = 'installation'
export const PUSH_WEBHOOK_TYPE = 'push'
export const WORKFLOW_RUN_WEBHOOK_TYPE = 'workflow_run'
export const WEBHOOK_TYPES = [
  INSTALLATION_WEBHOOK_TYPE,
  WORKFLOW_RUN_WEBHOOK_TYPE,
  PUSH_WEBHOOK_TYPE
] as const
export type WebhookType = (typeof WEBHOOK_TYPES)[number]

export function isWebhookType(x: unknown): x is WebhookType {
  return WEBHOOK_TYPES.includes(x as WebhookType)
}
