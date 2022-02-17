import schedule from 'node-schedule';
import GitHubHelper from './GitHubHelper';
import DockerHelper from './DockerHelper';
import EnvHelper from './EnvHelper';

export default class Reloader {
  private static checkRunning = false;
  private static updateRunning = false;
  private static gitHubHelper: GitHubHelper;
  private static dockerHelper: DockerHelper;
  private static updateJob: any;

  static async start(env: any) {
    try {
      console.log('Welcome');
      let envHelper = new EnvHelper(env);
      Reloader.gitHubHelper = new GitHubHelper(envHelper);
      await Reloader.gitHubHelper.prepare();
      console.log(
        'Watching now: ' +
          Reloader.gitHubHelper.github_owner +
          '/' +
          Reloader.gitHubHelper.github_repo +
          ' for updates'
      );

      Reloader.dockerHelper = new DockerHelper(envHelper);

      console.log('Start Reloader');
      let schedule_time = envHelper.getScheduleTimeForChecks();
      if (Reloader.isValidScheduleTime(schedule_time)) {
        Reloader.tryCheckForUpdates();
        const checkJob = schedule.scheduleJob(schedule_time, async function () {
          await Reloader.tryCheckForUpdates();
        });
        while (true) {
          await Reloader.sleep(5000);
        }
      } else {
        console.log(
          '[ERROR] No Valid ' +
            EnvHelper.SCHEDULE_TIME_CHECK_FIELD +
            ' was given'
        );
      }
    } catch (err) {
      console.log('Infinite Loop breaked!');
      console.log(err);
    }
  }

  static sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms, null));
  }

  private static async tryCheckForUpdates() {
    console.log('tryCheckForUpdates');
    if (Reloader.isCheckAllowed()) {
      Reloader.checkRunning = true;
      let updateObject = await Reloader.gitHubHelper.getNextUpdateObject();
      if (!!updateObject && !!updateObject.sha) {
        await Reloader.planOrRunUpdate(updateObject);
      }
      Reloader.checkRunning = false;
    }
  }

  private static isCheckAllowed() {
    if (Reloader.updateRunning) {
      //console.log("- Skipped check, because an update is running");
      return false;
    }
    if (Reloader.checkRunning) {
      //console.log("- Skipped check, because a check is already running");
      return false;
    }
    return true;
  }

  private static async planOrRunUpdate(updateObject: any) {
    let commit_id = updateObject.sha;
    let schedule_update_time = updateObject.schedule_update_time;
    if (Reloader.isValidScheduleTime(schedule_update_time)) {
      console.log('Update planed for: ' + schedule_update_time);
      Reloader.updateJob = schedule.scheduleJob(
        schedule_update_time,
        async function () {
          await Reloader.tryUpdating(commit_id);
          Reloader.updateJob = null; //reset updateJob
        }
      );
    } else {
      let startUpdate = true;
      if (!!Reloader.updateJob) {
        console.log('A planed job will be canceled');
        let jobCancelSuccess = Reloader.updateJob.cancel(); //check if cancel was successfull;
        if (!startUpdate) {
          console.log('Update Job could not be canceled');
        }
        startUpdate = jobCancelSuccess;
      }
      if (startUpdate) {
        await Reloader.tryUpdating(commit_id);
      }
    }
  }

  private static isUpdateAllowed() {
    if (Reloader.updateRunning) {
      console.log('Skipped update! An update is already running');
      return false;
    }
    return true;
  }

  private static async tryUpdating(commit_id: any) {
    if (Reloader.isUpdateAllowed()) {
      Reloader.updateRunning = true;
      await Reloader.handleUpdate(commit_id);
      Reloader.updateRunning = false;
    }
  }

  private static async handleUpdate(commit_id: any) {
    console.log('Handle Update');
    await Reloader.dockerHelper.stop();
    await Reloader.gitHubHelper.pullRepo(commit_id);
    Reloader.gitHubHelper.setCurrentCommitId(commit_id);
    await Reloader.dockerHelper.prepare();
    await Reloader.dockerHelper.start();
  }

  private static isValidScheduleTime(time: any) {
    let testTime = time + '';
    let splits = testTime.split(' ');
    return splits.length === 6;
  }

  /**
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
}
