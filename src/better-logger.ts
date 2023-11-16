import winston, { Logger, createLogger } from 'winston';
import { ecsFormat } from '@elastic/ecs-winston-format';
import colorize, { Colors } from 'colorts';
import DailyRotateFile from 'winston-daily-rotate-file';
import color from 'colorts';
import { LoggerService } from '@nestjs/common';

type LogType = 'INFO' | 'WARN' | 'FETAL' | 'DEBUG' | 'ERROR';
const customLevels = {
  info: 0,
  warn: 1,
  error: 2,
  debug: 3,
  fetal: 4,
};

export type LimitedDailyRoatateOptions = {
  maxSize: string;
  maxFiles: string;
};

export type BetterLoggerSettings = {
  serviceName: string;
  serviceVersion?: string;
  removeNewlineFormat?: boolean;
  printFormat?: winston.Logform.Format;
  dailyRotateOptions?: LimitedDailyRoatateOptions;
};

export class BetterLogger implements LoggerService {
  private static logger: Logger;
  private settings: BetterLoggerSettings = {} as BetterLoggerSettings;

  private colorLevelMap: { [key in LogType]: keyof Colors } = {
    INFO: 'yellow',
    WARN: 'magenta',
    FETAL: 'bgRed',
    DEBUG: 'bgGreen',
    ERROR: 'red',
  };

  setLogger(settings: BetterLoggerSettings) {
    this.settings = settings;
    const winstonLogger = this._generateLogger(settings);
    BetterLogger.logger = winstonLogger;
  }

  /**
   *
   * @param message The log itself, can be any message, log
   * @param additionalData Extra parameters, good usage for Elasticsearch, can be filtered later
   */
  log(message: any, functionName: string = '', context = '', ...additionalData: any[]): void {
    const logData: { [key: string]: any } = { message, context, functionName };
    this._addAdditionalDataFormatter(logData, additionalData);

    BetterLogger.logger.info(logData);
  }

  /**
   *
   * @param message The log itself, can be any message, log
   * @param additionalData Extra parameters, good usage for Elasticsearch, can be filtered later
   */
  fetal(message: any, functionName = '', context = '', ...additionalData: any[]): void {
    const logData: { [key: string]: any } = { message, context, functionName };
    this._addAdditionalDataFormatter(logData, additionalData);

    BetterLogger.logger.log('fetal', logData);
  }

  /**
   *
   * @param message The log itself, can be any message, log
   * @param additionalData Extra parameters, good usage for Elasticsearch, can be filtered later
   */
  warn(message: any, functionName = '', context = '', ...additionalData: any[]): void {
    const logData: { [key: string]: any } = { message, context, functionName };
    this._addAdditionalDataFormatter(logData, additionalData);

    BetterLogger.logger.warn(logData);
  }

  /**
   *
   * @param message The log itself, can be any message, log
   * @param additionalData Extra parameters, good usage for Elasticsearch, can be filtered later
   */
  error(
    data: string | typeof Error,
    functionName = '',
    context = '',
    ...additionalData: any[]
  ): void {
    const message = data instanceof Error ? data.message : data;
    const logData: { [key: string]: any } = { message, context, functionName };

    if (data instanceof Error) additionalData.push({ error: data.stack?.replace('Error: ', '') });

    this._addAdditionalDataFormatter(logData, additionalData);

    BetterLogger.logger.error(logData);
  }

  /**
   *
   * @param message The log itself, can be any message, log
   * @param additionalData Extra parameters, good usage for Elasticsearch, can be filtered later
   */
  debug(message: any, functionName = '', context = '', ...additionalData: any[]): void {
    const logData = { message, context, functionName };
    this._addAdditionalDataFormatter(logData, additionalData);

    BetterLogger.logger.debug(logData);
  }

  private _generateDailyRotationTransport() {
    const { serviceName, serviceVersion, dailyRotateOptions } = this.settings;
    const formattedVersion = serviceVersion ? `-${serviceVersion}` : '';

    return new DailyRotateFile({
      auditFile: 'logs/config.json',
      format: this._generateFileFormat(this.settings),
      filename: `logs/${serviceName}${formattedVersion}.json`,
      datePattern: 'DD-MM-YYYY-THH-mm',
      maxSize: dailyRotateOptions?.maxSize || '20m',
      maxFiles: dailyRotateOptions?.maxFiles || '7d',
    });
  }

  private _generatePrintFormat() {
    return winston.format.printf(
      ({ timestamp, level, message, functionName, context, ...rest }) => {
        const logLevel = `${rest['log.level']}`.toUpperCase();
        const serviceName = rest['service.name'];
        const serviceVersion = rest['service.version'] ? ` v${rest['service.version']}` : '';

        const formattedLog = `[${colorize(
          `${serviceName}${serviceVersion}`,
        ).magenta.toString()}] [${colorize(timestamp).bold}] - ${
          context && `[${color(context).grey}] - `
        }[${colorize(functionName).gray}] - ${this._colorizeLevel(logLevel as LogType)} - ${
          colorize(message).green.bold
        }`;

        const minimumKeys = serviceVersion.length > 0 ? 6 : 5;
        if (Object.keys(rest).length <= minimumKeys) {
          return formattedLog;
        }

        const additionalData = this._formatAdditionalData(rest);

        return `${formattedLog}\n${colorize('Addional Details:').yellow}\n${additionalData}`;
      },
    );
  }

  private _generateLogger(settings: BetterLoggerSettings) {
    const { serviceName, serviceVersion, printFormat } = settings;
    const elasticFormat = ecsFormat({ serviceName, serviceVersion });
    const defaultPrintFormat = this._generatePrintFormat();
    const timestampFormat = winston.format.timestamp({ format: 'DD-MM-YYYY hh:mm:ss' });

    return createLogger({
      levels: customLevels,
      transports: [
        this._generateDailyRotationTransport(),
        new winston.transports.Console({
          level: 'fetal', // Which max level can be shown
          format: winston.format.combine(
            elasticFormat,
            timestampFormat,
            printFormat || defaultPrintFormat,
          ),
        }),
      ],
    });
  }

  private _generateFileFormat({ serviceName, serviceVersion = '' }: BetterLoggerSettings) {
    const elasticFormat = ecsFormat({ serviceName, serviceVersion });
    if (!this.settings.removeNewlineFormat) {
      return winston.format.combine(elasticFormat, winston.format.json());
    }

    const removeNewlineFormat = winston.format((info) => {
      if (info.message) {
        info.message = info.message.replace(/\n/g, ''); // Remove newline characters
      }
      return info;
    });

    return winston.format.combine(elasticFormat, winston.format.json(), removeNewlineFormat());
  }

  private _formatAdditionalData(data: Record<string, any>): string {
    const lines = Object.entries(data).map(([key, value]) => {
      return `${colorize(`${key}`).blue}: ${colorize(`${value}`).bold.blue}`;
    });

    return lines.slice(0, this.settings.serviceVersion ? -6 : -5).join('\n');
  }

  private _addAdditionalDataFormatter(
    logData: { [key: string]: any },
    additionalData: any[],
  ): void {
    additionalData.forEach((obj) => {
      if (typeof obj === 'object' && obj) {
        // If the parameter is an object, merge it into the logData
        Object.assign(logData, obj.name ? { [`${obj.name}`]: JSON.stringify(obj) } : obj);
      } else if (typeof obj === 'string' && obj !== 'error') {
        // If the parameter is a string, add an empty object with the string as the key
        const oldData = logData['misc'] || [];
        oldData.push(obj);
        logData['misc'] = oldData;
      }
    });
  }

  private _colorizeLevel(logLevel: LogType): string {
    const colorFunction: keyof Colors = this.colorLevelMap[logLevel] || 'white'; // Default to white if no match

    return colorize(logLevel)[colorFunction].toString();
  }
}
