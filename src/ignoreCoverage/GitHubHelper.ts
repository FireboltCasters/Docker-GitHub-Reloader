import EnvHelper from './EnvHelper';
import {Octokit} from '@octokit/rest';
// @ts-ignore
import ExecHelper from './ExecHelper';
import RepositoryManagementInterface from './RepositoryManagementInterface';
import ScheduleCommentHelper from './ScheduleCommentHelper';
import Reloader from './Reloader';

export default class GitHubHelper implements RepositoryManagementInterface {
  static ENV_NAME = 'GitHub';

  static MOCK = false;

  github_owner: any;
  github_repo: any;
  private git_token: any;
  private git_username: any;
  private git_fieldname_credential_user: any;
  private github_branch: any;
  private path_to_github_project: any;

  private octokit: Octokit;
  private current_commit_id = undefined;

  constructor(env: EnvHelper) {
    this.path_to_github_project = env.getFolderPathToGitHubProject();

    this.github_owner = env.getGitHubOwnerName();
    this.github_repo = env.getGitHubRepoName();

    this.git_token = env.getGitHubAuthToken();
    this.git_username = env.getGitAuthUsername();
    this.git_fieldname_credential_user =
      env.getGitUsernameFieldName() || 'username';
    this.github_branch = env.getGitHubBranchName();

    let userAgent = Reloader.agent;
    console.log(userAgent);
    this.octokit = new Octokit({
      auth: env.getGitHubAuthToken(),
      userAgent: userAgent,
    });
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

  private setCurrentCommitId(commit_id: any) {
    this.current_commit_id = commit_id;
  }

  private isDifferentCommit(latest_commit: any) {
    return GitHubHelper.isDifferentCommit(
      latest_commit,
      this.current_commit_id
    );
  }

  public static isDifferentCommit(latest_commit: any, current_commit_id: any) {
    if (!!latest_commit && !!latest_commit.sha) {
      let changedCommitId = latest_commit.sha !== current_commit_id;
      if (changedCommitId) {
        return true;
      }
    }
    return false;
  }

  private getScheduleUpdateTimeFromCommitRaw(commitRaw: any): any {
    let commit = commitRaw.commit;
    let author = commit.author;
    let author_name = author.login;
    let message = commit.message;
    //TODO maybe add support to filter for author

    return ScheduleCommentHelper.getScheduleUpdateTimeFromMessage(message);
  }

  private async getLatestCommit(): Promise<{sha: any}> {
    if (GitHubHelper.MOCK) {
      return this.getRandomFakeCommit();
    }

    try {
      let options = {
        owner: this.github_owner,
        repo: this.github_repo,
        sha: this.github_branch,
        per_page: 1, //get the latest only
      };
      const {data: response} = await this.octokit.rest.repos.listCommits(
        options
      );

      if (!!response && typeof response === 'object' && response.length >= 1) {
        let commit = response[0];
        if (!!commit && typeof commit === 'object') {
          return commit;
        }
      }
    } catch (err) {
      if (err.status === 404) {
        console.log(
          'Project not found. For Private Repos set ' +
            EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN_FIELD
        );
      } else {
        console.log(err);
      }
    }

    return {sha: undefined};
  }

  private getRandomFakeCommit(): any {
    return {
      sha: Math.random() + 'D',
      commit: {
        author: {
          login: Math.random() + '',
        },
        message: Math.random() + '',
      },
    };
  }

  async pullRepo(commit_id: any) {
    let success = await GitHubHelper.pullRepoRaw(
      commit_id,
      this.path_to_github_project,
      this.git_token,
      this.git_username,
      this.git_fieldname_credential_user
    );
    if (success) {
      this.setCurrentCommitId(commit_id);
    }
    return success;
  }

  public static async pullRepoRaw(
    commit_id: any,
    path_to_github_project: string,
    token: any,
    username: any,
    usernameCredentialField: any
  ) {
    console.log('-- pullRepo start');
    if (!usernameCredentialField) {
      usernameCredentialField = 'email';
    }

    console.log('path_to_github_project: ', path_to_github_project);
    console.log('token: ', token);
    console.log('username: ', username);

    let commandToPull = 'git pull';

    if (!!token) {
      let commandToSetCredentials = '';
      //TODO this can be done nicer
      if (!!username) {
        commandToSetCredentials =
          'git -c credential.helper=\'!f() { echo "password=' +
          token +
          '\n' +
          usernameCredentialField +
          '=' +
          username +
          '"; }; f\' fetch origin';
      } else {
        //https://stackoverflow.com/questions/11506124/how-to-enter-command-with-password-for-git-pull
        //git -c credential.helper='!f() { echo "password=mysecretpassword"; }; f' fetch origin
        commandToSetCredentials =
          'git -c credential.helper=\'!f() { echo "password=' +
          token +
          '"; }; f\' fetch origin';
      }
      commandToPull = commandToSetCredentials + ' && ' + commandToPull;
    }

    let command =
      GitHubHelper.getCommandToGitProjectRaw(path_to_github_project) +
      commandToPull;
    try {
      let result = await ExecHelper.exec(command);
      console.log('-- pullRepo finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        //TODO test what happens for uncommited changes
        /**
         err.stderr
         From https://xxxxxx/owner/repo
         09feaa8..5344af0  main       -> origin/main
         */
        console.log('-- pullRepo finished');
        return true;
      } else {
        console.log('Okay no idea whats going on');
        console.log(err);
      }
    }
    console.log('-- pullRepo failed');
    return false;
  }

  public static getCommandToGitProjectRaw(path_to_git_project: string): string {
    return 'cd ' + path_to_git_project + ' && ';
  }

  public static async getRepoInformations(path_to_github_project: any) {
    let answer = {
      owner: undefined,
      repo: undefined,
    };

    let url = await GitHubHelper.getRepoURL(path_to_github_project);
    if (!!url) {
      //url = https://github.com/FireboltCasters/RocketMealsApp.git
      url = url.replace('.git', '');
      url = url.replace('\n', '');
      let splits = url.split('/');
      let length = splits.length;
      if (length >= 2) {
        answer.owner = splits[length - 2];
        answer.repo = splits[length - 1];
      }
    }
    return answer;
  }

  public static async getRepoURL(path_to_github_project: any): Promise<any> {
    let commandToGetInformation = 'git config --get remote.origin.url';
    let command =
      GitHubHelper.getCommandToGitProjectRaw(path_to_github_project) +
      commandToGetInformation;
    try {
      let result = await ExecHelper.exec(command);
      return result;
    } catch (err) {
      console.log(err);
    }
    return undefined;
  }
}
