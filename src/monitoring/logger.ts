import * as winston from 'winston';
import { MonitoringConfig } from '../config/types';

export class Logger {
  private logger: winston.Logger;

  constructor(config: MonitoringConfig['logging']) {
    const format = config.format === 'json'
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          })
        );

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: config.level,
      }),
    ];

    if (config.file) {
      transports.push(
        new winston.transports.File({
          filename: config.file,
          level: config.level,
        })
      );
    }

    this.logger = winston.createLogger({
      level: config.level,
      format,
      transports,
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }
}

let loggerInstance: Logger | null = null;

export function getLogger(config?: MonitoringConfig['logging']): Logger {
  if (!loggerInstance && config) {
    loggerInstance = new Logger(config);
  }
  if (!loggerInstance) {
    // Default logger
    loggerInstance = new Logger({ level: 'info', format: 'json' });
  }
  return loggerInstance;
}
