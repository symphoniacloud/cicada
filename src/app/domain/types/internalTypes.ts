import { GitHubWorkflow, GitHubWorkflowRunEvent } from '../../ioTypes/GitHubTypes.js'

export type FullGitHubWorkflowRunEvent = GitHubWorkflowRunEvent & GitHubWorkflow
