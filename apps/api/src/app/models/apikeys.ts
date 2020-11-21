import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongooseValidationErrorTransform from 'mongoose-validation-error-transform';

const ApiKey = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: 'Email Already Exists `{VALUE}`!',
      index: true,
    },

    apiKey: {
      type: String,
      unique: 'Key Already Exists `{VALUE}`. Try Again',
      index: true,
    },

    uuid: {
      type: String,
      unique: 'Key Already Exists `{VALUE}`. Try Again',
      index: true,
    },
  },
  { timestamps: true },
);

/**
 * Plugin to beautify the unique error messages and transform to display messages.
 */
ApiKey.plugin(beautifyUnique, {
  defaultMessage: 'Email Already Exists ({VALUE})!',
});

ApiKey.plugin(mongooseValidationErrorTransform, {
  humanize: true,
  transform: messages => {
    return messages.join(', ');
  },
});
export default mongoose.model<mongoose.Document>('ApiKeys', ApiKey);
