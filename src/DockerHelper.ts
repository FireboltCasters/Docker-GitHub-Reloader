import EnvHelper from "./EnvHelper";
import ExecHelper from "./ExecHelper";

export default class DockerHelper {

  private readonly pathToDockerProject: any;
  private readonly runPrepare: boolean;

  constructor(env: EnvHelper) {
    this.pathToDockerProject = env.getFolderPathToDockerProject();
    this.runPrepare = env.getPrepareDockerProject();
  }

  async stop(): Promise<boolean>{
    return await this.stopDockerCompose();
  }

  private async stopDockerCompose(): Promise<boolean>{
    console.log("-- stopContainer start");
    let commandToStopDocker = "docker-compose down";
    try{
      let result = await ExecHelper.exec(this.getCommandToDockerProject()+commandToStopDocker);
      console.log("-- stopContainer finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        /** This "error" of the console is still a success
         Removing ... done
         Removing ... done
         Network ... is external, skipping
         Removing network ...
         */
        return err.stderr.includes("done");
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- stopContainer failed");
    return false;
  }

  async prepare(): Promise<boolean>{
    if(this.runPrepare){
      await this.removeContainer();
      await this.dockerPull();
      return await this.dockerBuildImage();
    } else {
      return true;
    }
  }

  async start(): Promise<boolean>{
    return await this.startDockerCompose();
  }

  private async startDockerCompose(){
    console.log("-- startContainer start");
    let commandToStopDocker = "docker-compose up --build -d";
    try{
      let result = await ExecHelper.exec(this.getCommandToDockerProject()+commandToStopDocker);
      console.log("-- startContainer finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        /** docker-compose up shows this as an error on the console
         Starting ...
         Starting ... done
         ... is up-to-date
         */
        console.log(err.stderr);
        console.log("-- startContainer finished");
        return err.stderr.includes("done");
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- startContainer failed");
    return false;
  }

  private async removeContainer(){
    console.log("-- removeContainer start");
    let commandToRemoveContainer = "docker-compose rm -f";
    try{
      let result = await ExecHelper.exec(this.getCommandToDockerProject()+commandToRemoveContainer);
      console.log("-- removeContainer finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        console.log("-- removeContainer finished");
        return true;
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- removeContainer failed");
    return false;
  }

  private async dockerBuildImage(){
    //TODO
    //https://stackoverflow.com/questions/10232192/exec-display-stdout-live


    console.log("-- rebuildImage start");
    let commandToRemoveContainer = "docker-compose build --no-cache --force-rm";
    try{
      let result = await ExecHelper.exec(this.getCommandToDockerProject()+commandToRemoveContainer);
      console.log("-- rebuildImage finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        console.log(err.stderr);
        // no such file or directory
        // Building 152.7s (8/8) FINISHED
        console.log("-- rebuildImage finished");
        return true;
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- rebuildImage failed");
    return false;
    //docker build . --no-cache
    //docker-compose pull
  }

  private async dockerPull(){
    console.log("-- dockerPull start");
    let commandToRemoveContainer = "docker-compose pull";
    try{
      let result = await ExecHelper.exec(this.getCommandToDockerProject()+commandToRemoveContainer);
      console.log("-- dockerPull finished");
      return true;
    } catch (err){
      if(!!err && !!err.stderr){
        // no such file or directory
        // Building 152.7s (8/8) FINISHED
        console.log("-- dockerPull finished");
        return true;
      } else {
        console.log("Okay no idea whats going on");
        console.log(err);
      }
    }
    console.log("-- dockerPull failed");
    return false;
    //docker build . --no-cache
    //docker-compose pull
  }

  private getCommandToDockerProject(){
    return "cd "+this.pathToDockerProject+" && ";
  }

}
