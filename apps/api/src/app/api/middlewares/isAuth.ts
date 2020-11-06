/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import { environment } from '../../../environments/environment';
import { Container } from 'typedi';
import axios from 'axios';
import { Logger } from 'winston';
import { auth } from 'googleapis/build/src/apis/abusiveexperiencereport';

const getTokenFromHeader = (req, next) => {
	/**
	 * @TODO Edge and Internet Explorer do some weird things with the headers
	 * So I believe that this should handle more 'edge' cases ;)
	 */
	try {
		if (
			(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
			(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
		) {
      return req.headers.authorization.split(' ')[1];
		} else {
			throw new Error('No Authorization Header Found!');
		}
	} catch (e) {
		return next(e);
	}
};

const isAuth = async (req, res, next) => {
	const logger: Logger = Container.get('logger');
	logger.debug('Verifying JWT Token');
	const token  = getTokenFromHeader(req, next);
	try {
    const data: any = await jwt.verify(token, environment.appSecret);
    if (data) {
      req.token = token;
      req.userId = data._id;
      return next();
    } else {
      throw new Error('Invalid Token');
    }
	} catch (e) {
		logger.error('🔥 error: %o', e);
		return next(e);
	}
};

export default isAuth;
