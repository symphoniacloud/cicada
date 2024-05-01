export function getEventUpdatedTimestamp({ updatedAt }: { updatedAt: string }) {
  return new Date(updatedAt).getTime()
}
