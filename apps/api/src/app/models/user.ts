import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongooseValidationErrorTransform from 'mongoose-validation-error-transform';

const User = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please enter a full name'],
			index: true,
		},

		email: {
			type: String,
			lowercase: true,
			unique: 'Email Already Exists `{VALUE}`!',
			index: true,
		},

		password: String,

    lastLogin: {
			type: Date,
			default: null,
		},

		salt: String,
	},
	{ timestamps: true },
);

/**
 * Plugin to beautify the unique error messages and transform to display messages.
 */
User.plugin(beautifyUnique, {
	defaultMessage: 'Email Already Exists ({VALUE})!',
});

User.plugin(mongooseValidationErrorTransform, {
	humanize: true,
	transform: messages => {
		return messages.join(', ');
	},
});
export default mongoose.model<IUser & mongoose.Document>('User', User);
