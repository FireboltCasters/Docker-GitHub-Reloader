import EnvHelper from './EnvHelper';
import {Octokit} from '@octokit/rest';
// @ts-ignore
import ExecHelper from './ExecHelper';
import RepositoryManagementInterface from './RepositoryManagementInterface';
import ScheduleCommentHelper from './ScheduleCommentHelper';
import Reloader from './Reloader';
import LogHelper from './LogHelper';

export default class GitHubHelper implements RepositoryManagementInterface {
  static ENV_NAME = 'GitHub';
  static DEFAULT_BRANCH = 'main';

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
  private logger: LogHelper;

  constructor(env: EnvHelper, logger: LogHelper) {
    this.logger = logger;
    this.path_to_github_project = env.getFolderPathToRepositoyProject();

    this.github_owner = env.getRepositoryOwnerName();
    this.github_repo = env.getRepositoryName();

    this.git_token = env.getGitHubAuthToken();
    this.git_username = env.getGitAuthUsername();
    this.git_fieldname_credential_user =
      env.getGitUsernameFieldName() || 'username';
    this.github_branch = env.getRepositoryBranchName();

    let userAgent = Reloader.agent;
    this.logger.debug(userAgent);
    this.octokit = new Octokit({
      auth: env.getGitHubAuthToken(),
      userAgent: userAgent,
    });
  }

  async prepare() {
    if (!this.github_owner || !this.github_repo) {
      let informations = await GitHubHelper.getRepoInformations(
        this.path_to_github_project,
        this.logger
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
    Reloader.logger.debug(latest_commit)
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
    Reloader.logger.debug("isDifferentCommit")
    if (!!latest_commit && !!latest_commit.sha) {
      Reloader.logger.debug("latest_commit.sha: "+latest_commit.sha)
      Reloader.logger.debug("current_commit_id: "+current_commit_id)
      return latest_commit.sha !== current_commit_id;
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
        this.logger.error(
          'Project not found. For Private Repos set ' +
            EnvHelper.GIT_AUTH_PERSONAL_ACCESS_TOKEN
        );
      } else {
        this.logger.error(err);
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
      this.git_fieldname_credential_user,
      this.logger
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
    usernameCredentialField: any,
    logger: LogHelper
  ) {
    logger.info('-- pullRepo start');

    logger.debug('path_to_github_project: ', path_to_github_project);
    logger.debug('token: ', token);
    logger.debug('username: ', username);

    let commandToPull = 'git pull';

    if (!!token || !!username) {
      let commandToSetCredentials = GitHubHelper.getCommandToSetCredentials(
        username,
        usernameCredentialField,
        token
      );
      commandToPull = commandToSetCredentials + ' && ' + commandToPull;
      let commandToClearCredentials = GitHubHelper.getCommandToSetCredentials(
        '',
        usernameCredentialField,
        ''
      );
      commandToPull += ' && ' + commandToClearCredentials;
    }

    let command =
      GitHubHelper.getCommandToGitProjectRaw(path_to_github_project) +
      commandToPull;
    try {
      let result = await Reloader.execHelper.exec(command);
      logger.info('-- pullRepo finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        //TODO test what happens for uncommited changes
        /**
         err.stderr
         From https://xxxxxx/owner/repo
         09feaa8..5344af0  main       -> origin/main
         */
        logger.info('-- pullRepo finished');
        return true;
      } else {
        logger.error('Okay no idea whats going on');
        logger.error(err);
      }
    }
    logger.error('-- pullRepo failed');
    return false;
  }

  static getCommandToSetCredentials(
    username: string,
    usernameCredentialField: string,
    token: string
  ) {
    let commandToSetCredentials = '';
    if (!!token || !!username) {
      commandToSetCredentials +=
        "git config credential.helper '!f() { sleep 1; ";
      //TODO this can be done nicer
      // but we will move the credentials into env variables https://git-scm.com/docs/gitcredentials#_custom_helpers
      if (!!username) {
        commandToSetCredentials +=
          'echo "' + usernameCredentialField + '=' + username + '"; ';
      }
      if (!!token) {
        //https://stackoverflow.com/questions/11506124/how-to-enter-command-with-password-for-git-pull
        //git -c credential.helper='!f() { echo "password=mysecretpassword"; }; f' fetch origin
        commandToSetCredentials += 'echo "password=' + token + '"; ';
      }
      commandToSetCredentials += "}; f'";
    }
    return commandToSetCredentials;
  }

  public static getCommandToGitProjectRaw(path_to_git_project: string): string {
    return 'cd ' + path_to_git_project + ' && ';
  }

  public static async getRepoInformations(
    path_to_github_project: any,
    logger: LogHelper
  ) {
    let answer = {
      owner: undefined,
      repo: undefined,
    };

    let url = await GitHubHelper.getRepoURL(path_to_github_project, logger);
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

  public static async getRepoURL(
    path_to_github_project: any,
    logger: LogHelper
  ): Promise<any> {
    let commandToGetInformation = 'git config --get remote.origin.url';
    let command =
      GitHubHelper.getCommandToGitProjectRaw(path_to_github_project) +
      commandToGetInformation;
    try {
      let result = await Reloader.execHelper.exec(command);
      return result;
    } catch (err) {
      logger.error(err);
    }
    return undefined;
  }
}
