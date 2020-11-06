/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from 'winston';
import { environment } from '../../environments/environment';

const customLevels = {
  levels: {
    trace: 5,
    silly: 4,
    debug: 3,
    info: 2,
    error: 1,
    production: 0,
  },
  colors: {
    trace: 'white',
    silly: 'yellow',
    debug: 'green',
    info: 'blue',
    error: 'red',
    production: 'blue',
  },
};

const formatter = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message } = info;

    return `${timestamp} [${level}]: ${message}`;
  }),
);

class Logger {
  private logger: winston.Logger;

  constructor() {
    const transport = new winston.transports.Console({
      format: formatter,
    });
    this.logger = winston.createLogger({
      level: environment.production ? 'error' : 'trace',
      levels: customLevels.levels,
      transports: [transport],
    });
    winston.addColors(customLevels.colors);
  }

  trace(msg: any, meta?: any) {
    this.logger.log('trace', msg, meta);
  }

  silly(msg: any, meta?: any) {
    this.logger.silly(msg, meta);
  }

  debug(msg: any, meta?: any) {
    this.logger.debug(msg, meta);
  }

  info(msg: any, meta?: any) {
    this.logger.info(msg, meta);
  }

  warn(msg: any, meta?: any) {
    this.logger.warn(msg, meta);
  }

  error(msg: any, meta?: any) {
    this.logger.error(msg, meta);
  }

  production(msg: any, meta?: any) {
    this.logger.log('production', msg, meta);
  }
}

export default new Logger();
