import auth from './auth';
import agendash from './agendash';
import { Router, Request, Response } from 'express';

export default (app: Router) => {
	auth(app);
	agendash(app);

  app.get('/ping', (_req: Request, _res: Response) => {
    _res.status(200).json({
      status: 200,
      message: 'Server Connected',
    });
  });
};
