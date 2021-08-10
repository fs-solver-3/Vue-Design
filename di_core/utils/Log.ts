export enum LogLevel {
  Off = 0,
  Error = 1,
  Info = 2,
  Debug = 3,
  All = 4
}

export class Log {
  /**
   * return current log level bind to window, default will be Level Off
   */
  static getLevel(): LogLevel {
    return window.logLevel ?? LogLevel.Off;
  }

  static debug(...data: any) {
    Log.printLog(LogLevel.Debug, data);
    //Doing something with debug level (post log, ...)
    if (Log.getLevel() >= LogLevel.Debug) {
      Log.postLog(data);
    }
  }

  static info(...data: any) {
    Log.printLog(LogLevel.Info, data);
    //Doing something with info level (post log, ...)
    if (Log.getLevel() >= LogLevel.Info) {
      Log.postLog(data);
    }
  }

  static error(...data: any) {
    Log.printLog(LogLevel.Error, data);
    //Doing something with error level (post log, ...)
    if (Log.getLevel() >= LogLevel.Error) {
      Log.postLog(data);
    }
  }

  private static printLog(level: LogLevel, data: any[]) {
    const enable = window.dumpLog ?? false;
    if (enable) {
      switch (level) {
        case LogLevel.Error:
          // eslint-disable-next-line no-console
          console.error(...data);
          break;
        case LogLevel.Info:
          // eslint-disable-next-line no-console
          console.info(...data);
          break;
        case LogLevel.All:
        case LogLevel.Debug:
          // eslint-disable-next-line no-console
          console.log(...data);
          break;
        default:
          break;
      }
    }
  }

  private static postLog(...data: any) {
    //TODO: Post log data to server
  }
}
