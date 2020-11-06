import Agenda from 'agenda';
import { environment } from '../../environments/environment';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default ({ mongoConnection }) => {

  return new Agenda({
    db: { address: environment.databaseURL, collection: environment.agenda.dbCollection},
  });
  /**
   * This voodoo magic is proper from agenda.js so I'm not gonna explain too much here.
   * https://github.com/agenda/agenda#mongomongoclientinstance
   */
};
