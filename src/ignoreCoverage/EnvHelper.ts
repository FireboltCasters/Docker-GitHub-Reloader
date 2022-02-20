import GitHubHelper from './GitHubHelper';
import GitLabHelper from './GitLabHelper';

export default class EnvHelper {
  static readonly LOG_LEVEL = 'LOG_LEVEL';
  static readonly SCHEDULE_TIME_CHECK_FIELD = 'SCHEDULE_TIME_CHECK';
  static readonly SCHEDULE_TIME_UPDATE_FIELD = 'SCHEDULE_TIME_STATIC_UPDATE'; //TODO implement logic
  static readonly REPOSITORY_MANAGEMENT_FIELD = 'REPOSITORY_MANAGEMENT';
  static readonly REPOSITORY_MANAGEMENT_BASE_URL_FIELD =
    'REPOSITORY_MANAGEMENT_BASE_URL';
  static readonly GIT_AUTH_PERSONAL_ACCESS_TOKEN_FIELD =
    'GIT_AUTH_PERSONAL_ACCESS_TOKEN';
  static readonly GIT_AUTH_USERNAME_FIELD = 'GIT_AUTH_USERNAME';
  static readonly GIT_AUTH_CREDENTIAL_FIELDNAME_USER =
    'GIT_AUTH_CREDENTIAL_FIELDNAME_USER';
  static readonly GIT_PROJECT_OWNER_FIELD = 'GIT_PROJECT_OWNER';
  static readonly GIT_PROJECT_REPO_FIELD = 'GIT_PROJECT_REPO';
  static readonly GIT_BRANCH_FIELD = 'GIT_BRANCH';
  static readonly FOLDER_PATH_TO_PROJECT_FIELD = 'FOLDER_PATH_TO_PROJECT';
  static readonly FOLDER_PATH_TO_GIT_REPO_FIELD = 'FOLDER_PATH_TO_GIT_REPO';
  static readonly FOLDER_PATH_TO_DOCKER_PROJECT_FIELD =
    'FOLDER_PATH_TO_DOCKER_PROJECT';
  static readonly DOCKER_PROJECT_PREPARE_FIELD = 'DOCKER_PROJECT_PREPARE';

  static readonly CUSTOM_COMMAND_DOCKER_STOP_FIELD =
    'CUSTOM_COMMAND_DOCKER_STOP'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_REMOVE_FIELD =
    'CUSTOM_COMMAND_DOCKER_REMOVE'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_REBUILD_FIELD =
    'CUSTOM_COMMAND_DOCKER_REBUILD'; //TODO implement logic
  static readonly CUSTOM_COMMAND_DOCKER_START_FIELD =
    'CUSTOM_COMMAND_DOCKER_START'; //TODO implement logic

  private readonly env = {
    [EnvHelper.LOG_LEVEL]: null,
    [EnvHelper.SCHEDULE_TIME_CHECK_FIELD]: null,
    [EnvHelper.SCHEDULE_TIME_UPDATE_FIELD]: null,
    [EnvHelper.REPOSITORY_MANAGEMENT_FIELD]: null,
    [EnvHelper.REPOSITORY_MANAGEMENT_BASE_URL_FIELD]: null,
    [EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN_FIELD]: null,
    [EnvHelper.GIT_AUTH_USERNAME_FIELD]: null,
    [EnvHelper.GIT_AUTH_CREDENTIAL_FIELDNAME_USER]: null,
    [EnvHelper.GIT_PROJECT_OWNER_FIELD]: null,
    [EnvHelper.GIT_PROJECT_REPO_FIELD]: null,
    [EnvHelper.GIT_BRANCH_FIELD]: null,
    [EnvHelper.FOLDER_PATH_TO_PROJECT_FIELD]: null,
    [EnvHelper.FOLDER_PATH_TO_GIT_REPO_FIELD]: null,
    [EnvHelper.FOLDER_PATH_TO_DOCKER_PROJECT_FIELD]: null,
    [EnvHelper.DOCKER_PROJECT_PREPARE_FIELD]: null,

    [EnvHelper.CUSTOM_COMMAND_DOCKER_STOP_FIELD]: null,
    [EnvHelper.CUSTOM_COMMAND_DOCKER_REMOVE_FIELD]: null,
    [EnvHelper.CUSTOM_COMMAND_DOCKER_REBUILD_FIELD]: null,
    [EnvHelper.CUSTOM_COMMAND_DOCKER_START_FIELD]: null,
  };

  constructor(env: any) {
    this.env = env || {};
  }

  getLogLevel() {
    return this.env[EnvHelper.LOG_LEVEL] || undefined;
  }

  /**
   * Reloader Schedule Time for Checks of Changes
   */

  getScheduleTimeForChecks() {
    return this.env[EnvHelper.SCHEDULE_TIME_CHECK_FIELD] || '0 */5 * * * *';
  }

  getFolderPathToProject() {
    return this.env[EnvHelper.FOLDER_PATH_TO_PROJECT_FIELD] || undefined;
  }

  getRepositoryManagementName(): any {
    return (
      this.env[EnvHelper.REPOSITORY_MANAGEMENT_FIELD] || GitHubHelper.ENV_NAME
    );
  }

  getRepositoryManagementBaseURL(): any {
    return (
      this.env[EnvHelper.REPOSITORY_MANAGEMENT_BASE_URL_FIELD] || undefined
    );
  }

  /**
   * Git Auth
   */

  getGitHubAuthToken() {
    return (
      this.env[EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN_FIELD] || undefined
    );
  }

  getGitAuthUsername() {
    return this.env[EnvHelper.GIT_AUTH_USERNAME_FIELD] || undefined;
  }

  getGitUsernameFieldName() {
    return this.env[EnvHelper.GIT_AUTH_CREDENTIAL_FIELDNAME_USER] || undefined;
  }

  /**
   * GitHub Check for Updates
   */

  getGitHubOwnerName() {
    return this.env[EnvHelper.GIT_PROJECT_OWNER_FIELD];
  }

  getGitHubRepoName() {
    return this.env[EnvHelper.GIT_PROJECT_REPO_FIELD];
  }

  getGitHubBranchName() {
    return this.env[EnvHelper.GIT_BRANCH_FIELD] || undefined || 'main';
  }

  getFolderPathToGitHubProject() {
    return (
      this.env[EnvHelper.FOLDER_PATH_TO_DOCKER_PROJECT_FIELD] ||
      this.getFolderPathToProject()
    );
  }

  /**
   * Docker
   */

  getFolderPathToDockerProject() {
    return (
      this.env[EnvHelper.FOLDER_PATH_TO_DOCKER_PROJECT_FIELD] ||
      this.getFolderPathToProject()
    );
  }

  getPrepareDockerProject(): boolean {
    return this.env[EnvHelper.DOCKER_PROJECT_PREPARE_FIELD] === 'true' || true; //TODO remove default Value
  }
}
