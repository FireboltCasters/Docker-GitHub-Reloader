import EnvHelper from './EnvHelper';
import {Octokit} from '@octokit/rest';
// @ts-ignore
import myPackage from "./../package.json";
import ExecHelper from "./ExecHelper";

export default class GitHubHelper {
  static MOCK = false;

  github_owner: any;
  github_repo: any;
  private github_token: any;
  private github_branch: any;
  private path_to_github_project: any;

  private octokit: Octokit;
  private current_commit_id = {sha: undefined};

  constructor(env: EnvHelper) {
    this.path_to_github_project = env.getFolderPathToGitHubProject();

    this.github_owner = env.getGitHubOwnerName();
    this.github_repo = env.getGitHubRepoName();

    this.github_token = env.getGitHubAuthToken();
    this.github_branch = env.getGitHubBranchName();

    let userAgent = myPackage.name + ' v' + myPackage.version;
    console.log(userAgent);
    this.octokit = new Octokit({
      auth: env.getGitHubAuthToken(),
      userAgent: userAgent,
    });
  }

  async prepare(){
    if(!this.github_owner || !this.github_repo){
      let informations = await this.getRepoInformations();
      if(!this.github_owner){
        this.github_owner = informations.owner;
      }
      if(!this.github_repo){
        this.github_repo = informations.repo;
      }
    }
  }

  async getNextUpdateObject(): Promise<{sha: any, schedule_update_time: any}>{
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

  setCurrentCommitId(latest_commit: any) {
    this.current_commit_id = latest_commit.sha;
  }

  private isDifferentCommit(latest_commit: any) {
    if (!!latest_commit && !!latest_commit.sha) {
      let changedCommitId = latest_commit.sha !== this.current_commit_id;
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

    /** return SCHEDULE TIME AS STRING
     *    *    *    *    *    *
     ┬    ┬    ┬    ┬    ┬    ┬
     │    │    │    │    │    │
     │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
     │    │    │    │    └───── month (1 - 12)
     │    │    │    └────────── day of month (1 - 31)
     │    │    └─────────────── hour (0 - 23)
     │    └──────────────────── minute (0 - 59)
     └───────────────────────── second (0 - 59, OPTIONAL)
     */

    if(!!message){
      //TODO
      // message="sefioshe [IN 5 MIN]"
      // message="sefioshe [AT 00:00]" --> return "0 0 0 "
    }

    return undefined;
  }

  private async getLatestCommit(): Promise<{sha: any}> {
    if (GitHubHelper.MOCK) {
      return this.getRandomFakeCommit();
    }

    try{
      let options = {
        owner: this.github_owner,
        repo: this.github_repo,
        sha: this.github_branch,
        per_page: 1 //get the latest only
      }
      const { data: response } = await this.octokit.rest.repos.listCommits(options);

      if (!!response && typeof response === 'object' && response.length >= 1) {
        let commit = response[0];
        if (!!commit && typeof commit === 'object') {
          return commit;
        }
      }
    } catch (err){
      if(err.status===404){
        console.log("Project not found. For Private Repos set "+EnvHelper.GITHUB_AUTH_PERSONAL_ACCESS_TOKEN_FIELD);
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

  async pullRepo(commit_id: any){
    console.log("-- pullRepo start");

    let commandToPull = "git pull";

    let token = this.github_token;
    if(!!token){
      //https://stackoverflow.com/questions/11506124/how-to-enter-command-with-password-for-git-pull
      //git -c credential.helper='!f() { echo "password=mysecretpassword"; }; f' fetch origin
      let commandToSetCredentials = "git -c credential.helper='!f() { echo \"password="+token+"\"; }; f' fetch origin"
      commandToPull = commandToSetCredentials + " && " + commandToPull;
    }

    let command = this.getCommandToGitHubProject()+commandToPull;
    try{
      let result = await ExecHelper.exec(command);
      console.log("-- pullRepo finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        console.log("err.stderr");
        console.log(err.stderr);
        console.log("-- pullRepo finished");
        return true;
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- pullRepo failed");
    return false;
  }

  private getCommandToGitHubProject(){
    return "cd "+this.path_to_github_project+" && ";
  }

  private async getRepoInformations(){
    let answer = {
      owner: undefined,
      repo: undefined
    };

    let url = await this.getRepoURL();
    if(!!url){
      //url = https://github.com/FireboltCasters/RocketMealsApp.git
      url = url.replace(".git", "");
      url = url.replace("\n", "");
      let splits = url.split("/");
      let length = splits.length;
      if(length>=2){
        answer.owner = splits[length-2];
        answer.repo = splits[length-1];
      }
    }
    return answer;
  }

  private async getRepoURL(): Promise<any>{
    let commandToGetInformation = "git config --get remote.origin.url";
    let command = this.getCommandToGitHubProject()+commandToGetInformation;
    try{
      let result = await ExecHelper.exec(command);
      return result;
    } catch (err){
      console.log(err);
    }
    return undefined;
  }
}
