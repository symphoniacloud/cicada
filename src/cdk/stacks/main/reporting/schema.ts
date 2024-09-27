// TODO - eventually use the same runtime schema used in app code, e.g. using Powertools schema

const githubWorkflowRunBaseSchema = {
  accountId: 'number',
  accountName: 'string',
  accountType: 'string',
  repoId: 'number',
  repoName: 'string',
  repoHtmlUrl: 'string',
  workflowId: 'number',
  workflowName: 'string',
  path: 'string',
  workflowHtmlUrl: 'string',
  workflowBadgeUrl: 'string',
  id: 'number',
  runNumber: 'number',
  runAttempt: 'number',
  displayTitle: 'string',
  event: 'string',
  status: 'string',
  headBranch: 'string',
  headSha: 'string',
  conclusion: 'string',
  createdAt: 'string',
  updatedAt: 'string',
  runStartedAt: 'string',
  htmlUrl: 'string',
  actor: {
    login: 'string',
    id: 'number',
    avatarUrl: 'string',
    htmlUrl: 'string'
  }
}

export const githubWorkflowGlueSchema = toGlueSchema(githubWorkflowRunBaseSchema)
export const githubWorkflowAthenaSchema = toAthenaSchema(githubWorkflowRunBaseSchema)
export const topLevelGlueFields = topLevelFields(githubWorkflowRunBaseSchema)

export function toGlueSchema(x: object) {
  return Object.entries(x).map(([fieldName, fieldType]) => {
    return { name: camelToSnakeCase(fieldName), type: toGlueType(fieldType) }
  })
}

export function toAthenaSchema(x: object) {
  return Object.entries(x)
    .map(([fieldName, fieldType]) => {
      return `${camelToSnakeCase(fieldName)} ${toGlueType(fieldType)}`
    })
    .join(',\n    ')
}

export function topLevelFields(x: object) {
  return Object.keys(x).map(camelToSnakeCase)
}

export function stringArrayToCommaNewLineSeparated(xs: string[]) {
  return xs.join(',\n')
}

function camelToSnakeCase(s: string) {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function toGlueType(fieldType: string | object): string {
  if (typeof fieldType === 'string') {
    if (fieldType === 'string') return fieldType
    if (fieldType === 'number') return 'bigint'
    throw new Error(`field type ${fieldType} not supported`)
  }
  return flattenToStruct(toGlueSchema(fieldType))
}

// Only currently works for one level
function flattenToStruct(fields: { name: string; type: unknown }[]) {
  return `struct<${fields
    .map(({ name, type }) => {
      return `${name}:${type}`
    })
    .join(',')}>`
}
