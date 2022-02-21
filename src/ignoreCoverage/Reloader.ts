import schedule from 'node-schedule';
import RepositoryManagementHelper from './RepositoryManagementHelper';
import DockerHelper from './DockerHelper';
import EnvHelper from './EnvHelper';
import LogHelper from './LogHelper';
import ExecHelper from './ExecHelper';

export default class Reloader {
  public static agent = 'docker-github-reloader v0.0.4';
  private static checkRunning = false;
  private static updateRunning = false;
  private static repositoryHelper: RepositoryManagementHelper;
  private static dockerHelper: DockerHelper;
  private static updateJob: any;
  public static logger: LogHelper;
  static execHelper: ExecHelper;

  static async start(env: any) {
    try {
      let envHelper = new EnvHelper(env);
      let logger = new LogHelper(envHelper);
      Reloader.logger = logger;
      Reloader.logger.info('Welcome');
      Reloader.execHelper = new ExecHelper(envHelper);
      Reloader.repositoryHelper = new RepositoryManagementHelper(
        envHelper,
        logger
      );
      await Reloader.repositoryHelper.prepare();
      Reloader.logger.info(
        'Watching now: ' +
          (await Reloader.repositoryHelper.getWatchingRepositoryName()) +
          ' for updates'
      );

      Reloader.dockerHelper = new DockerHelper(envHelper, logger);

      /**
      let isDockerActive = await Reloader.dockerHelper.isDockerComposeRunning();
      if(!isDockerActive){
        Reloader.logger.info("[Reloader] Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?")
      }
      */

      Reloader.logger.info('Start Reloader');
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
        Reloader.logger.error(
          '[ERROR] No Valid ' + EnvHelper.SCHEDULE_TIME_CHECK + ' was given'
        );
      }
    } catch (err) {
      Reloader.logger.error('Infinite Loop breaked!');
      Reloader.logger.error(err);
    }
  }

  static sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms, null));
  }

  private static async tryCheckForUpdates() {
    if (Reloader.isCheckAllowed()) {
      Reloader.checkRunning = true;
      let updateObject = await Reloader.repositoryHelper.getNextUpdateObject();
      if (!!updateObject && !!updateObject.sha) {
        await Reloader.planOrRunUpdate(updateObject);
      }
      Reloader.checkRunning = false;
    }
  }

  private static isCheckAllowed() {
    if (Reloader.updateRunning) {
      Reloader.logger.info('An update is still running at ' + new Date());
      return false;
    }
    if (Reloader.checkRunning) {
      Reloader.logger.info("- Skipped check, because a check is already running");
      return false;
    }
    Reloader.logger.info('Start update at ' + new Date());
    return true;
  }

  private static async planOrRunUpdate(updateObject: any) {
    let commit_id = updateObject.sha;
    let schedule_update_time = updateObject.schedule_update_time;
    if (Reloader.isValidScheduleTime(schedule_update_time)) {
      Reloader.logger.info('Update planed for: ' + schedule_update_time);
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
        Reloader.logger.info('A planed job will be canceled');
        let jobCancelSuccess = Reloader.updateJob.cancel(); //check if cancel was successfull;
        if (!startUpdate) {
          Reloader.logger.error('Update Job could not be canceled');
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
      Reloader.logger.info('Skipped update! An update is already running');
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
    Reloader.logger.info('Handle Update');
    await Reloader.dockerHelper.stop();
    await Reloader.repositoryHelper.downloadNewUpdate(commit_id);
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
