import EnvHelper from "./EnvHelper";
import {Octokit} from "@octokit/rest";
// @ts-ignore
import myPackage from "./../package.json";

export default class GitHubHelper {

  static MOCK = false;

  private github_owner: any;
  private github_repo: any;
  private github_branch: any;
  private octokit: Octokit;
  private current_commit_id = {sha: undefined};

  constructor(env: EnvHelper) {
    this.github_owner = env.getGitHubOwnerName();
    this.github_repo = env.getGitHubRepoName();
    this.github_branch = env.getGitHubBranchName();

    let userAgent = myPackage.name+' v'+myPackage.version;
    console.log(userAgent);
    this.octokit = new Octokit({
      userAgent: userAgent,
    });
  }

  async getNextUpdateObject(): Promise<{sha: any, schedule_update_time: any}>{
    let answer = {
      sha: undefined,
      schedule_update_time: undefined
    };

    const latest_commit = await this.getLatestCommit();
      if(this.isDifferentCommit(latest_commit)){
        answer.sha = latest_commit.sha;
        answer.schedule_update_time = this.getScheduleUpdateTimeFromCommitRaw(latest_commit);
      }
    return answer;
  }

  setCurrentCommitId(latest_commit: any){
    this.current_commit_id = latest_commit.sha;
  }

  private isDifferentCommit(latest_commit: any){
    if(!!latest_commit && !!latest_commit.sha){
      let changedCommitId = latest_commit.sha !== this.current_commit_id;
      if(changedCommitId){
        return true;
      }
    }
    return false;
  }

  private getScheduleUpdateTimeFromCommitRaw(commitRaw: any): any{
    let commit = commitRaw.commit;
    let author = commit.author;
    let author_name = author.login;
    let message = commit.message;

  }

  private async getLatestCommit(): Promise<{ sha: any }>{
    if(GitHubHelper.MOCK){
      return this.getRandomFakeCommit();
    }


    try{
      const { data: response } = await this.octokit.rest.repos.listCommits({
        owner: this.github_owner,
        repo: this.github_repo,
        sha: this.github_branch,
        per_page: 1 //get the latest only
      });

      if(!!response && typeof response === "object" && response.length>=1){
        let commit = response[0];
        if(!!commit && typeof commit === "object"){
          return commit;
        }
      }
    } catch (err){
      //console.log(err);
    }

    return {sha: undefined};
  }

  private getRandomFakeCommit(): any{
    return {
      sha: Math.random()+"D",
      commit: {
        author: {
          login: Math.random()+"",
        },
        message: Math.random()+""
      }
    }
  }

  async pullRepo(commit_id: any){
    console.log("-- Pull repo start");
    console.log("-- Pull repo finished");
  }

}
