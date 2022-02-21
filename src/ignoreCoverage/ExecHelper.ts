import EnvHelper from './EnvHelper';
import {Reloader} from "../index";

const {exec} = require('child_process');

export default class ExecHelper {
  private readonly env: EnvHelper;

  constructor(env: EnvHelper) {
    this.env = env;
  }

  async exec(command: string) {
    command = this.addPreCommands(command);
    Reloader.logger.debug("ExecHelper exec: "+command);

    //TODO maybe we can add this
    //https://stackoverflow.com/questions/10232192/exec-display-stdout-live

    return new Promise((resolve, reject) => {
      exec(command, (error: {message: any}, stdout: unknown, stderr: any) => {
        if (error) {
          reject({error: error});
          return;
        }
        if (stderr) {
          reject({stderr: stderr});
          return;
        }
        resolve(stdout);
      });
    });
  }

  private addPreCommands(command: string) {
    Reloader.logger.debug("addPreCommands");
    //lets add exports for proxies
    let preProxyCommand = this.getProxyPreCommand();
    if (!!preProxyCommand) {
      command = preProxyCommand + ' && ' + command;
    }

    //lets add custom commands before all
    let preCommand = this.env.getCustomCommandPreCommands();
    if (!!preCommand) {
      command = preCommand + ' && ' + command;
    }
    return command;
  }

  private getProxyPreCommand() {
    Reloader.logger.debug("getProxyPreCommand");

    let httpProxy = this.env.getHttpProxy();
    let httpsProxy = this.env.getHttpsProxy();
    let noProxy = this.env.getNoProxy();
    if (!!httpProxy || !!httpsProxy || !!noProxy) {
      Reloader.logger.debug("getProxyPreCommand: true = !!httpProxy || !!httpsProxy || !!noProxy");
      let preProxyCommand = '';
      if (!!httpProxy) {
        Reloader.logger.debug("getProxyPreCommand: true = !!httpProxy");
        preProxyCommand +=
          'export HTTP_PROXY="' +
          httpProxy +
          '" && export http_proxy="' +
          httpProxy +
          '" && ';
      }
      if (!!httpsProxy) {
        Reloader.logger.debug("getProxyPreCommand: true = !!httpsProxy");
        preProxyCommand +=
          'export HTTPS_PROXY="' +
          httpsProxy +
          '" && export https_proxy="' +
          httpsProxy +
          '" && ';
      }
      if (!!noProxy) {
        Reloader.logger.debug("getProxyPreCommand: true = !!noProxy");
        preProxyCommand +=
          'export NO_PROXY="' +
          noProxy +
          '" && export no_proxy="' +
          noProxy +
          '" && ';
      }
      preProxyCommand = preProxyCommand.substr(0, preProxyCommand.length-(' && '.length)); //remove the additional connect
      Reloader.logger.debug("getProxyPreCommand: preProxyCommand: "+preProxyCommand);
      return preProxyCommand;
    }
    return null;
  }
}
