export default class EnvHelper {
  static readonly SCHEDULE_TIME_FIELD = 'SCHEDULE_TIME';
  static readonly GITHUB_OWNER_FIELD = 'GITHUB_OWNER';
  static readonly GITHUB_REPO_FIELD = 'GITHUB_REPO';
  static readonly GITHUB_BRANCH_FIELD = 'GITHUB_BRANCH';

  private readonly env = {
    [EnvHelper.SCHEDULE_TIME_FIELD]: null,
    [EnvHelper.GITHUB_OWNER_FIELD]: null,
    [EnvHelper.GITHUB_REPO_FIELD]: null,
    [EnvHelper.GITHUB_BRANCH_FIELD]: null,
  };

  constructor(env: any) {
    this.env = env || {};
  }

  getGitHubOwnerName() {
    return this.env[EnvHelper.GITHUB_OWNER_FIELD] || 'FireboltCasters';
  }

  getGitHubRepoName() {
    return this.env[EnvHelper.GITHUB_REPO_FIELD] || 'docker-github-reloader';
  }

  getGitHubBranchName() {
    return this.env[EnvHelper.GITHUB_BRANCH_FIELD] || undefined;
  }

  getScheduleTime() {
    return this.env[EnvHelper.SCHEDULE_TIME_FIELD] || '*/10 * * * * *';
  }
}
