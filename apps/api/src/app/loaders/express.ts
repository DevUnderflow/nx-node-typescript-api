import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import MasterRouter from '../api';
import { environment } from '../../environments/environment';
import path from 'path';

export default ({ app }: { app: express.Application }) => {
	/**
	 * Health Check endpoints
	 * @TODO Explain why they are here
	 */
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
