import * as dotenv from 'dotenv';
const envFound = dotenv.config();
if (envFound.error) {
  throw new Error(envFound.error.toString())
}

export const environment = {
  production: true,
  port: parseInt(process.env.PORT, 10),
  databaseURL: process.env.MONGODB_URI,
  appSecret: process.env.SECRET,
  api: {
    prefix_v1: '/api/v1',
  },
  OAuth2: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  },
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  /**
   * Agenda.js stuff
   */
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: process.env.AGENDA_POOL_TIME,
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY, 10),
  },
  agendash: {
    user: 'admin',
    password: 'admin',
  },
};
