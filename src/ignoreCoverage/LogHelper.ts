import EnvHelper from './EnvHelper';

export default class LogHelper {
  private readonly logLevel: any;

  constructor(env: EnvHelper) {
    this.logLevel = env.getLogLevel() || '1';
  }

  debug(...toPrint: any) {
    this.log(0, toPrint);
  }

  info(...toPrint: any) {
    this.log(1, toPrint);
  }

  warn(...toPrint: any) {
    this.log(2, toPrint);
  }

  error(...toPrint: any) {
    this.log(3, toPrint);
  }

  private log(level: any, toPrint: any) {
    if(typeof toPrint==="object" && toPrint.length===1){
      toPrint = toPrint[0];
    }

    if (level >= parseInt(this.logLevel)) {
      console.log(toPrint);
    }
  }
}
