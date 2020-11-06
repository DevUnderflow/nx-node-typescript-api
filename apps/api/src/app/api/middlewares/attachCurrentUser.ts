import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { Logger } from 'winston';

/**
 * * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  try {
    const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
    const userRecord = await UserModel.findById(req.userId);
    const data = userRecord.toObject();
    Reflect.deleteProperty(data, 'password');
    Reflect.deleteProperty(data, 'salt');
    req.currentUser = data;
    return next();
  } catch (e) {
    logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
