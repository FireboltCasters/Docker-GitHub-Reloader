import GitHubHelper from './GitHubHelper';
import GitLabHelper from './GitLabHelper';

export default class EnvHelper {
  static readonly LOG_LEVEL = 'LOG_LEVEL';
  static readonly SCHEDULE_TIME_CHECK = 'SCHEDULE_TIME_CHECK';
  static readonly SCHEDULE_TIME_UPDATE = 'SCHEDULE_TIME_STATIC_UPDATE'; //TODO implement logic
  static readonly REPOSITORY_MANAGEMENT = 'REPOSITORY_MANAGEMENT';
  static readonly REPOSITORY_MANAGEMENT_BASE_URL =
    'REPOSITORY_MANAGEMENT_BASE_URL';
  static readonly GIT_AUTH_PERSONAL_ACCESS_TOKEN =
    'GIT_AUTH_PERSONAL_ACCESS_TOKEN';
  static readonly GIT_AUTH_USERNAME = 'GIT_AUTH_USERNAME';
  static readonly GIT_AUTH_CREDENTIAL_FIELDNAME_USER =
    'GIT_AUTH_CREDENTIAL_FIELDNAME_USER';
  static readonly GIT_PROJECT_OWNER = 'GIT_PROJECT_OWNER';
  static readonly GIT_PROJECT_REPO = 'GIT_PROJECT_REPO';
  static readonly GIT_BRANCH = 'GIT_BRANCH';
  static readonly FOLDER_PATH_TO_PROJECT = 'FOLDER_PATH_TO_PROJECT';
  static readonly FOLDER_PATH_TO_GIT_REPO = 'FOLDER_PATH_TO_GIT_REPO';
  static readonly FOLDER_PATH_TO_DOCKER_PROJECT =
    'FOLDER_PATH_TO_DOCKER_PROJECT';

  static readonly CUSTOM_COMMAND_PRE_COMMANDS = 'CUSTOM_COMMAND_PRE_COMMANDS';
  static readonly HTTP_PROXY = 'HTTP_PROXY';
  static readonly HTTPS_PROXY = 'HTTPS_PROXY';
  static readonly NO_PROXY = 'NO_PROXY';

  static readonly DOCKER_PROJECT_PREPARE = 'DOCKER_PROJECT_PREPARE'; // boolean

  static readonly CUSTOM_COMMAND_DOCKER_STOP_FIELD =
    'CUSTOM_COMMAND_DOCKER_STOP'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_REMOVE_FIELD =
    'CUSTOM_COMMAND_DOCKER_REMOVE'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_REBUILD_FIELD =
    'CUSTOM_COMMAND_DOCKER_REBUILD'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_START_FIELD =
    'CUSTOM_COMMAND_DOCKER_START'; //TODO implement logic

  private readonly env: any;

  constructor(env: any) {
    this.env = env || {};
  }

  private getEnvValue(key: string): string | undefined {
    return this.env[key];
  }

  getLogLevel() {
    return this.getEnvValue(EnvHelper.LOG_LEVEL);
  }

  getCustomCommandPreCommands() {
    return this.getEnvValue(EnvHelper.CUSTOM_COMMAND_PRE_COMMANDS);
  }

  getHttpProxy() {
    return this.getEnvValue(EnvHelper.HTTP_PROXY);
  }

  getHttpsProxy() {
    return this.getEnvValue(EnvHelper.HTTPS_PROXY) || this.getHttpProxy();
  }

  getNoProxy() {
    return this.getEnvValue(EnvHelper.NO_PROXY);
  }

  /**
   * Reloader Schedule Time for Checks of Changes
   */

  getScheduleTimeForChecks() {
    return this.getEnvValue(EnvHelper.SCHEDULE_TIME_CHECK) || '0 */5 * * * *';
  }

  getFolderPathToProject() {
    return this.getEnvValue(EnvHelper.FOLDER_PATH_TO_PROJECT);
  }


  getRepositoryManagementName(): any {
    return (
      this.getEnvValue(EnvHelper.REPOSITORY_MANAGEMENT) || GitHubHelper.ENV_NAME
    );
  }

  getRepositoryManagementBaseURL(): any {
    return this.getEnvValue(EnvHelper.REPOSITORY_MANAGEMENT_BASE_URL);
  }

  /**
   * Git Auth
   */

  getGitHubAuthToken() {
    return this.getEnvValue(EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN);
  }

  getGitAuthUsername() {
    return this.getEnvValue(EnvHelper.GIT_AUTH_USERNAME);
  }

  getGitUsernameFieldName() {
    return this.getEnvValue(EnvHelper.GIT_AUTH_CREDENTIAL_FIELDNAME_USER);
  }

  /**
   * GitHub Check for Updates
   */

  getRepositoryOwnerName() {
    return this.getEnvValue(EnvHelper.GIT_PROJECT_OWNER);
  }

  getRepositoryName() {
    return this.getEnvValue(EnvHelper.GIT_PROJECT_REPO);
  }

  getRepositoryBranchName() {
    return this.getEnvValue(EnvHelper.GIT_BRANCH)  || GitHubHelper.DEFAULT_BRANCH;
  }

  getFolderPathToRepositoyProject() {
    return (
      this.getEnvValue(EnvHelper.FOLDER_PATH_TO_GIT_REPO) ||
      this.getFolderPathToProject()
    );
  }

  /**
   * Docker
   */

  getFolderPathToDockerProject() {
    return (
      this.getEnvValue(EnvHelper.FOLDER_PATH_TO_DOCKER_PROJECT) ||
      this.getFolderPathToProject()
    );
  }

  getPrepareDockerProject(): boolean {
    return (
      this.getEnvValue(EnvHelper.DOCKER_PROJECT_PREPARE) === 'true' || true
    ); //TODO remove default Value
  }
}
