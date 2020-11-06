import mongoose from 'mongoose';
import { Db } from 'mongodb';
import { environment } from '../../environments/environment';

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(environment.databaseURL, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
  return connection.connection.db;
};
