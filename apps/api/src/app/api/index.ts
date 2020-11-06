import { Router } from 'express';
import _subrouter from './routes';

// guaranteed to get dependencies
class MasterRouter {
  private _router: Router = Router();

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    _subrouter(this._router);
  }
}

export default MasterRouter;
