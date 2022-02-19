import EnvHelper from './EnvHelper';
import {Octokit} from '@octokit/rest';
// @ts-ignore
import myPackage from '../../package.json';
import RepositoryManagementInterface from './RepositoryManagementInterface';
import GitHubHelper from './GitHubHelper';
import axios from 'axios';
import ScheduleCommentHelper from './ScheduleCommentHelper';

export default class GitLabHelper implements RepositoryManagementInterface {
  static ENV_NAME = 'GitLab';

  github_owner: any;
  github_repo: any;
  private git_token: any;
  private git_username: any;
  private github_branch: any;
  private path_to_github_project: any;
  private base_url: any;

  private current_commit_id = undefined;

  constructor(env: EnvHelper) {
    console.log('USING GITLAB HELPER');
    this.path_to_github_project = env.getFolderPathToGitHubProject();

    this.github_owner = env.getGitHubOwnerName();
    this.github_repo = env.getGitHubRepoName();

    this.git_token = env.getGitHubAuthToken();
    this.git_username = env.getGitAuthUsername();
    this.github_branch = env.getGitHubBranchName();
    this.base_url = env.getRepositoryManagementBaseURL();
  }

  async prepare() {
    if (!this.github_owner || !this.github_repo) {
      let informations = await GitHubHelper.getRepoInformations(
        this.path_to_github_project
      );
      if (!this.github_owner) {
        this.github_owner = informations.owner;
      }
      if (!this.github_repo) {
        this.github_repo = informations.repo;
      }
    }
    return !!this.github_owner && !!this.github_repo;
  }

  async getWatchingRepositoryName(): Promise<string> {
    return this.github_owner + '/' + this.github_repo;
  }

  async getNextUpdateObject(): Promise<{sha: any; schedule_update_time: any}> {
    let answer = {
      sha: undefined,
      schedule_update_time: undefined,
    };

    const latest_commit = await this.getLatestCommit();
    if (this.isDifferentCommit(latest_commit)) {
      answer.sha = latest_commit.sha;
      answer.schedule_update_time =
        this.getScheduleUpdateTimeFromCommitRaw(latest_commit);
    }
    return answer;
  }

  async downloadNewUpdate(commit_id: string): Promise<boolean> {
    return await this.pullRepo(commit_id);
  }

  private setCurrentCommitId(latest_commit_id: any) {
    this.current_commit_id = latest_commit_id;
  }

  private isDifferentCommit(latest_commit: any) {
    return GitHubHelper.isDifferentCommit(
      latest_commit,
      this.current_commit_id
    );
  }

  private getScheduleUpdateTimeFromCommitRaw(commitRaw: any): any {
    let author_name = commitRaw.author_name;
    let author_email = commitRaw.author_email;
    let title = commitRaw.title;
    let message = commitRaw.message;
    //TODO maybe add support to filter for author

    return ScheduleCommentHelper.getScheduleUpdateTimeFromMessage(message);
  }

  private async getLatestCommit(): Promise<{sha: any}> {
    let project = await this.getProjectByOwnerAndRepo(
      this.github_owner,
      this.github_repo
    );
    if (!!project) {
      let commit = await this.getLastCommitOfProject(
        project.id,
        this.github_branch
      );
      if (!!commit.id) {
        commit.sha = commit.id;
        return commit;
      } else {
        console.log('Incorrect Commit?');
      }
    } else {
      console.log(
        'No Matching project found. Consider for adding a ' +
          EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN_FIELD
      );
    }

    return {sha: undefined};
  }

  async getLastCommitOfProject(project_id: any, branch: any) {
    //https://vm862.rz.uos.de/api/v4/projects/5/repository/commits?ref_name=BT
    let commits = await this.fetchGitLabAPIV4(
      'projects/' + project_id + '/repository/commits?ref_name=' + branch
    );
    if (!!commits && commits.length > 0) {
      return commits[0];
    }
    return null;
  }

  async getProjectByOwnerAndRepo(git_owner: any, repo: any) {
    let projects = await this.fetchGitLabAPIV4('projects/');
    let searchProjectPathWithNameSpaces = git_owner + '/' + repo;

    if (!!projects) {
      for (let project of projects) {
        let path_with_namespace = project.path_with_namespace;
        if (path_with_namespace === searchProjectPathWithNameSpaces) {
          return project;
        }
      }
    }
    return null;
  }

  async fetchGitLabAPIV4(path: any) {
    return await GitLabHelper.fetchGitLabAPI(
      this.base_url,
      'api/v4/' + path,
      this.git_token
    );
  }

  static async fetchGitLabAPI(base_url: any, path: any, token: any) {
    let headers = {};
    if (!!token) {
      // @ts-ignore
      headers['PRIVATE-TOKEN'] = token;
    }

    let url = base_url + path;

    try {
      const res = await axios.get(url, {
        headers: headers,
      });
      if (!!res) {
        return res.data;
      }
    } catch (err) {
      if (err.code === 404) {
        console.log('Not Found');
      }
      return undefined;
    }
  }

  async pullRepo(commit_id: any) {
    let success = await GitHubHelper.pullRepoRaw(
      commit_id,
      this.path_to_github_project,
      this.git_token,
      this.git_username,
      'username'
    );
    if (success) {
      this.setCurrentCommitId(commit_id);
    }
    return success;
  }
}
