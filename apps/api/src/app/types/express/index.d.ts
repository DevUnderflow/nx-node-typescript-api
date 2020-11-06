/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser';
declare global {
	namespace Express {
		export interface Request {
			currentUser: IUser & Document;
			token: string;
		}
	}

	namespace Models {
		export type UserModel = Model<IUser & Document>;
	}
}
