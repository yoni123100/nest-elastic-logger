import { BetterLogger } from './better-logger';

export class BetterLoggerService extends BetterLogger {
  constructor(private context = 'NestApplication') {
    super();
  }

  /**
   * @level INFO - level messages are the most prevalent, highlighting events within a system that is crucial for its business purposes,
   *               such as starting or stopping services or resources being created, accessed, updated or deleted.
   * @param functionName
   * @param optionalParams - Any object will have his keys as indices later in Elastic
   * @notice Any string that you'll append to optionalParams will be later labeled as 'misc'
   */
  log(message: string, functionName: string, ...optionalParams: any[]) {
    super.log(message, functionName, this.context, ...optionalParams);
  }

  /**
   * @level ERROR - represent situations which prevent an application from performing its usual operations normally.
   * @param message
   * @param functionName
   * @param optionalParams - Any object will have his keys as indices later in Elastic
   * @notice Any string that you'll append to optionalParams will be later labeled as 'misc'
   */
  error(message: string, functionName: string, ...optionalParams: any[]) {
    super.error(message, functionName, this.context, ...optionalParams);
  }

  /**
   * @level WARN - represent error conditions that prevent an application from functioning as it should. Although the application still functions, its existence should prompt developers or operations personnel to attend to it immediately.
   * @param message
   * @param functionName
   * @param optionalParams - Any object will have his keys as indices later in Elastic
   * @notice Any string that you'll append to optionalParams will be later labeled as 'misc'
   */
  warn(message: string, functionName: string, ...optionalParams: any[]) {
    super.warn(message, functionName, this.context, ...optionalParams);
  }

  /**
   * @level DEBUG - level messages are for developers only, can be used for any log needed.
   * @param message
   * @param functionName
   * @param optionalParams - Any object will have his keys as indices later in Elastic
   * @notice Any string that you'll append to optionalParams will be later labeled as 'misc'
   */
  debug(message: string, functionName: string, ...optionalParams: any[]) {
    super.debug(message, functionName, this.context, ...optionalParams);
  }

  /**
   * @level FETAL - level messages are much rarer and indicate a severe problem that cannot continue operating normally. While the application can continue functioning normally, their presence should prompt dev, ops and support teams to take immediate action in response.
   * @param message
   * @param functionName
   * @param optionalParams - Any object will have his keys as indices later in Elastic
   * @notice Any string that you'll append to optionalParams will be later labeled as 'misc'
   */
  fetal(message: string, functionName: string, ...optionalParams: any[]) {
    super.fetal(message, functionName, this.context, ...optionalParams);
  }

  setContext(context: string) {
    this.context = context;
  }
}
