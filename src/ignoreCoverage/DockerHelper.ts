import ExecHelper from './ExecHelper';
import EnvHelper from './EnvHelper';
import LogHelper from './LogHelper';
import {Reloader} from '../index';

//TODO refactor to DeployManagementHelper and DeployeManagementInterface like done for GitHub and GitLab
export default class DockerHelper {
  private readonly pathToDockerProject: any;
  private readonly runPrepare: boolean;
  private readonly logger: LogHelper;

  constructor(env: EnvHelper, logger: LogHelper) {
    this.logger = logger;
    this.pathToDockerProject = env.getFolderPathToDockerProject();
    this.runPrepare = env.getPrepareDockerProject();
  }

  async stop(): Promise<boolean> {
    return await this.stopDockerCompose();
  }

  async isDockerComposeRunning(): Promise<boolean> {
    this.logger.info('-- isDockerComposeRunning start');
    let commandToStopDocker = 'docker ps';
    try {
      let result = await Reloader.execHelper.exec(commandToStopDocker);
      this.logger.debug(result);
      this.logger.info('-- isDockerComposeRunning finished');
      return true;
    } catch (err) {
      if (!!err && !!err.error) {
        let errorMessage = err.error.toString();
        if (errorMessage.includes('Cannot connect to the Docker daemon')) {
          return false;
        }
      }
      this.logger.error('Okay no idea whats going on');
      this.logger.error(err);
    }
    this.logger.error('-- isDockerComposeRunning failed');
    return false;
  }

  private async stopDockerCompose(): Promise<boolean> {
    this.logger.info('-- stopContainer start');
    let commandToStopDocker = 'docker-compose down';
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + commandToStopDocker
      );
      this.logger.info('-- stopContainer finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        /** This "error" of the console is still a success
         Removing ... done
         Removing ... done
         Network ... is external, skipping
         Removing network ...
         */
        return err.stderr.includes('done');
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- stopContainer failed');
    return false;
  }

  async prepare(): Promise<boolean> {
    if (this.runPrepare) {
      await this.removeContainer();
      await this.removeOrphans();
      await this.deleteImages();
      await this.dockerPull();
      return await this.dockerBuildImage();
    } else {
      return true;
    }
  }

  async start(): Promise<boolean> {
    return await this.startDockerCompose();
  }

  private async startDockerCompose() {
    this.logger.info('-- startContainer start');
    let commandToStopDocker = 'docker-compose up --build -d';
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + commandToStopDocker
      );
      this.logger.info('-- startContainer finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        /** docker-compose up shows this as an error on the console
         Starting ...
         Starting ... done
         ... is up-to-date
         */
        this.logger.info('-- startContainer finished');
        return err.stderr.includes('done');
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- startContainer failed');
    return false;
  }

  private async deleteImages() {
    //let command = `docker rmi $(docker images | grep "^<none>" | awk '{print $3}')`; // removing all the unused Images.
    let command = 'docker rmi $(docker images -a -q)'; //Delete all images (dangling or not)
    this.logger.info('-- deleteImages start');
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + command
      );
      this.logger.info('-- deleteImages finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        this.logger.info('-- deleteImages finished');
        return true;
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- deleteImages failed');
    return false;
  }

  private async removeOrphans() {
    //You can use the following command to delete orphaned volumes :
    let command = 'docker volume rm $(docker volume ls -qf dangling=true)';
    this.logger.info('-- removeOrphans start');
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + command
      );
      this.logger.info('-- removeOrphans finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        //no orphans left
        // "docker volume rm" requires at least 1 argument.
        this.logger.info('-- removeOrphans finished');
        return err.toString().includes('requires at least 1 argument');
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- removeOrphans failed');
    return false;
  }

  private async removeContainer() {
    this.logger.info('-- removeContainer start');
    let commandToRemoveContainer = 'docker-compose rm -f';
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + commandToRemoveContainer
      );
      this.logger.info('-- removeContainer finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        this.logger.info('-- removeContainer finished');
        return true;
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- removeContainer failed');
    return false;
  }

  private async dockerBuildImage() {
    //TODO
    //https://stackoverflow.com/questions/10232192/exec-display-stdout-live

    this.logger.info('-- rebuildImage start');
    let commandToRemoveContainer = 'docker-compose build --no-cache --force-rm';
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + commandToRemoveContainer
      );
      this.logger.info('-- rebuildImage finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        this.logger.info(err.stderr);
        // no such file or directory
        // Building 152.7s (8/8) FINISHED
        this.logger.info('-- rebuildImage finished');
        return true;
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- rebuildImage failed');
    return false;
    //docker build . --no-cache
    //docker-compose pull
  }

  private async dockerPull() {
    this.logger.info('-- dockerPull start');
    let commandToRemoveContainer = 'docker-compose pull';
    try {
      let result = await Reloader.execHelper.exec(
        this.getCommandToDockerProject() + commandToRemoveContainer
      );
      this.logger.info('-- dockerPull finished');
      return true;
    } catch (err) {
      if (!!err && !!err.stderr) {
        // no such file or directory
        // Building 152.7s (8/8) FINISHED
        this.logger.info('-- dockerPull finished');
        return true;
      } else {
        this.logger.error('Okay no idea whats going on');
        this.logger.error(err);
      }
    }
    this.logger.error('-- dockerPull failed');
    return false;
    //docker build . --no-cache
    //docker-compose pull
  }

  private getCommandToDockerProject() {
    return 'cd ' + this.pathToDockerProject + ' && ';
  }
}
