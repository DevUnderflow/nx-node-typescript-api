import 'reflect-metadata'; // We need this in order to use @Decorators
import express from 'express';
import Logger from './loaders/logger';
import { environment } from '../environments/environment';

class BootstrapApp {
	private appModule: express.Application;

  constructor() {
  if (environment.production) {
    Logger.production(`Starting ${process.pid} server...`);
    Logger.production(` | Machine : ${process.platform} [USER] : ${process.env.USERNAME}`);
  }
    this.appModule = express();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    global.__basedir = __dirname;
    /**
     * A little hack here
     * Async/Await cannot used in Class methods
     * So instead Promises are used here
     * @method Preconfig
     **/
    new Promise(resolve => {
      /**
       * Import/Export can only be used in 'top-level code'
       * So using good old require statements.
       **/
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      resolve(require('./loaders').default({ expressApp: this.appModule }));
    }).then(() => {
      if (environment.production) {
        Logger.production(`Dependencies injected...`)
      }
      this.initiate_server(this.appModule);
    });
  }

  private initiate_server(app: express.Application) {
    app.listen(environment.port, () => {
    if (environment.production) {
    Logger.production(`Production server started...`)
    Logger.production(`Listening on port ${environment.port}`)
    }
    Logger.info(`
      ********************************
      * Server listening on: ${environment.port}
      * ${process.env.NODE_ENV} Environment
      ********************************
      `,
    );
    });
  }
}

export default BootstrapApp;
