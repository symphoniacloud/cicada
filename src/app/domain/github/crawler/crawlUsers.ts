import { AppState } from '../../../environment/AppState.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'
import { processRawUsers } from '../githubUser.js'
import { isSuccess } from '../../../util/structuredResult.js'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../../ioTypes/GitHubSchemas.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import { RawGithubUserSchema } from '../../../ioTypes/RawGitHubSchemas.js'

export async function crawlUsers(
  appState: AppState,
  installation: GitHubInstallation,
  githubClient: GithubInstallationClient
) {
  const latestUnparsedUsers = await readRawUsers(installation, githubClient)
  await processRawUsers(
    appState,
    latestUnparsedUsers.map((x) => RawGithubUserSchema.parse(x)),
    installation
  )
}

async function readRawUsers(
  installation: GitHubInstallation,
  githubClient: GithubInstallationClient
): Promise<unknown[]> {
  switch (installation.accountType) {
    case ORGANIZATION_ACCOUNT_TYPE:
      return await githubClient.listOrganizationMembers(installation.accountName)
    case USER_ACCOUNT_TYPE: {
      const getUserResult = await githubClient.getUser(installation.accountName)
      if (isSuccess(getUserResult)) {
        return [getUserResult.result]
      } else {
        throw new Error(getUserResult.reason)
      }
    }
    default:
      throw new Error(`Unknown installation account type: ${installation.accountType}`)
  }
}
