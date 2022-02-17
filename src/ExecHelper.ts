const { exec, spawn } = require("child_process");

export default class ExecHelper {

  static async exec(command: string){
    //TODO
    //https://stackoverflow.com/questions/10232192/exec-display-stdout-live

    return new Promise((resolve, reject) => {
      exec(command, (error: { message: any; }, stdout: unknown, stderr: any) => {
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
    })
  }


}
