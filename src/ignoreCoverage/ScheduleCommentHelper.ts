import EnvHelper from './EnvHelper';
import {Octokit} from '@octokit/rest';
// @ts-ignore
import myPackage from '../../package.json';
import ExecHelper from './ExecHelper';
import RepositoryManagementInterface from "./RepositoryManagementInterface";

export default class ScheduleCommentHelper{

  //TODO maybe add author_name or other things to filter for
  public static getScheduleUpdateTimeFromMessage(message: any): any {

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

    if (!!message) {
      //TODO extract the transform into an extra class, so that GitLabHelper can use it too, or any other
      // message="sefioshe [IN 5 MIN]"
      // message="sefioshe [AT 00:00]" --> return "0 0 0 "
    }

    return undefined;
  }

}
