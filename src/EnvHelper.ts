export default class EnvHelper {
  static readonly SCHEDULE_TIME_FIELD = 'SCHEDULE_TIME';
  static readonly GITHUB_OWNER_FIELD = 'GITHUB_OWNER';
  static readonly GITHUB_REPO_FIELD = 'GITHUB_REPO';
  static readonly GITHUB_BRANCH_FIELD = 'GITHUB_BRANCH';

  static readonly SCHEDULE_TIME_CHECK_FIELD = 'SCHEDULE_TIME_CHECK';
  static readonly SCHEDULE_TIME_UPDATE_FIELD = 'SCHEDULE_TIME_STATIC_UPDATE'; //TODO implement logic
  static readonly GITHUB_AUTH_PERSONAL_ACCESS_TOKEN_FIELD =
    'GITHUB_AUTH_PERSONAL_ACCESS_TOKEN';
  static readonly GITHUB_PROJECT_OWNER_FIELD = 'GITHUB_PROJECT_OWNER';
  static readonly GITHUB_PROJECT_REPO_FIELD = 'GITHUB_PROJECT_REPO';
  static readonly FOLDER_PATH_TO_PROJECT_FIELD = 'FOLDER_PATH_TO_PROJECT';
  static readonly FOLDER_PATH_TO_GITHUB_REPO_FIELD =
    'FOLDER_PATH_TO_GITHUB_REPO';
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
    [EnvHelper.SCHEDULE_TIME_CHECK_FIELD]: null,
    [EnvHelper.SCHEDULE_TIME_UPDATE_FIELD]: null,
    [EnvHelper.GITHUB_AUTH_PERSONAL_ACCESS_TOKEN_FIELD]: null,
    [EnvHelper.GITHUB_PROJECT_OWNER_FIELD]: null,
    [EnvHelper.GITHUB_PROJECT_REPO_FIELD]: null,
    [EnvHelper.GITHUB_BRANCH_FIELD]: null,
    [EnvHelper.FOLDER_PATH_TO_PROJECT_FIELD]: null,
    [EnvHelper.FOLDER_PATH_TO_GITHUB_REPO_FIELD]: null,
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

  /**
   * Reloader Schedule Time for Checks of Changes
   */

  getScheduleTimeForChecks() {
    return this.env[EnvHelper.SCHEDULE_TIME_CHECK_FIELD] || '0 */5 * * * *';
  }

  getFolderPathToProject() {
    return (
      this.env[EnvHelper.FOLDER_PATH_TO_PROJECT_FIELD] ||
      '/Users/nbaumgartner/Documents/GitHub/RocketMealsBackend'
    );
  }

  /**
   * GitHub Auth
   */

  getGitHubAuthToken() {
    return (
      this.env[EnvHelper.GITHUB_AUTH_PERSONAL_ACCESS_TOKEN_FIELD] || undefined
    );
  }

  /**
   * GitHub Check for Updates
   */

  getGitHubOwnerName() {
    return this.env[EnvHelper.GITHUB_PROJECT_OWNER_FIELD];
  }

  getGitHubRepoName() {
    return this.env[EnvHelper.GITHUB_PROJECT_REPO_FIELD];
  }

  getGitHubBranchName() {
    return this.env[EnvHelper.GITHUB_BRANCH_FIELD] || undefined;
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
