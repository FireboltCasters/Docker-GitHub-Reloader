export default interface RepositoryManagementInterface {
  prepare(): Promise<boolean>;
  getWatchingRepositoryName(): Promise<string>;
  getNextUpdateObject(): Promise<{sha: any; schedule_update_time: any}>;
  downloadNewUpdate(commit_id: any): Promise<boolean>;
}
