import uuidAPIKey  from 'uuid-apikey';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import MasterRouter from '../api';
import { environment } from '../../environments/environment';
import path from 'path';
import helmet from 'helmet';
import { Container } from 'typedi';
import mongoose from 'mongoose';

export default ({ app }: { app: express.Application }) => {
	/**
	 * Health Check endpoints
	 * @TODO Explain why they are here
	 */

  app.use(helmet());
	app.get('/status', (_req, res) => {
		res.status(200).end();
	});
	app.head('/status', (_req, res) => {
		res.status(200).end();
  });

	// app.use((req, res, next) => {
	//   res.header('Access-Control-Allow-Origin', 'https://app.eklavya.tech');
	//   //update to match the domain you will make the request from
	//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	//   next();
	// });

	// Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
	// It shows the real origin IP in the heroku or Cloudwatch logs
	app.enable('trust proxy');

	// The magic package that prevents frontend developers going nuts
	// Alternate description:
	// Enable Cross Origin Resource Sharing to all origins by default
	app.use(cors());

	// Some sauce that always add since 2014
	// "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
	// Maybe not needed anymore ?
	// eslint-disable-next-line @typescript-eslint/no-var-requires
  app.use(require('method-override')());
  app.use('/static', express.static(path.join(__dirname ,'public')));
	// Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());

  /**
   *  @POST Generate API Keys
   *  @params { email }
   */
  app.post(`${environment.api.prefix_v1}/generateApiKey`, async (req: Request, res: Response) => {
    try {
      const { apiKey, uuid } = uuidAPIKey.create();
      const apiKeyModel = Container.get('ApiKeys') as mongoose.Model<mongoose.Document>;
      const newAPIKey = await apiKeyModel.create({
        email: req.body.email,
        apiKey,
        uuid,
      })
      newAPIKey ? res.status(200).json({ apiKey }) : res.status(400).json({ message: 'Error generating API Key' });
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: "Error generating API Key!"});
    }
  });

   /**
   *  @Middleware  Check If API Key Valid
   *  @headers  { 'x-api-key' : <VALUE> }
   */
  app.use( async (req, _res, _next) => {
    const apiKeyModel = Container.get('ApiKeys') as mongoose.Model<{email: string, apiKey: string, uuid: string} & mongoose.Document>;
    const xAPIKey = req.headers['x-api-key'] as string;
    if (!xAPIKey) {
      _res.status(401);
      _res.json({
          message: 'Please set x-api-key header!!',
      });
    }

    const apiKeyResponse = await apiKeyModel.findOne({ apiKey: xAPIKey });
    if (!apiKeyResponse) {
      _res.status(401);
      _res.json({
        message: 'API key not valid!',
      });
    }
    uuidAPIKey.check(xAPIKey, apiKeyResponse.uuid) ? (_next() ) : ( _res.status(401).json({ message: 'API key not valid!'}) )
  })

	// Load API routes
  app.use(environment.api.prefix_v1, new MasterRouter().router);

	/// catch 404 and forward to error handler
	app.use((_req, _res, next) => {
		const err = new Error('Not Found');
		err['status'] = 404;
		next(err);
  });

	/// error handlers

	app.use((err, _req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
		 */
    if (err.name === 'UnauthorizedError') {
      return res
      .status(err.status)
      .send({ message: err.message })
      .end();
		}
		return next(err);
	});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(async (err, _req, res, _next) => {
		res.status(err.status || 500);
		res.json({
			errors: {
				message: err.message,
			},
		});
	});
};
