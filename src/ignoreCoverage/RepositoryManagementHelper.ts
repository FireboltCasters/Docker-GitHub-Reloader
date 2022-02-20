import EnvHelper from './EnvHelper';
import RepositoryManagementInterface from './RepositoryManagementInterface';
import GitHubHelper from './GitHubHelper';
import GitLabHelper from './GitLabHelper';
import LogHelper from "./LogHelper";

export default class RepositoryManagementHelper
  implements RepositoryManagementInterface
{
  private implementation: RepositoryManagementInterface;

  constructor(env: EnvHelper, logger: LogHelper) {
    this.implementation = this.getRepositoryImplementation(env, logger);
  }

  private getRepositoryImplementation(
    env: EnvHelper,
    logger: LogHelper
  ): RepositoryManagementInterface {
    let repositoryManagementName = env.getRepositoryManagementName();
    switch (repositoryManagementName) {
      case GitLabHelper.ENV_NAME:
        return new GitLabHelper(env, logger);
      default:
        return new GitHubHelper(env, logger);
    }
  }

  async prepare(): Promise<boolean> {
    return await this.implementation.prepare();
  }

  async getWatchingRepositoryName(): Promise<string> {
    return await this.implementation.getWatchingRepositoryName();
  }

  async getNextUpdateObject(): Promise<{sha: any; schedule_update_time: any}> {
    try {
      return await this.implementation.getNextUpdateObject();
    } catch (err) {
      console.log(err);
    }
    return {
      sha: undefined,
      schedule_update_time: undefined,
    };
  }

  async downloadNewUpdate(commit_id: any): Promise<boolean> {
    return await this.implementation.downloadNewUpdate(commit_id);
  }
}
