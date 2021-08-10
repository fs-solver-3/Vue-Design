export class DIException extends Error {
  constructor(message: string, public statusCode?: number, public reason?: string) {
    super(message);
  }

  static fromObject(ex: DIException): DIException {
    return new DIException(ex.message, ex.statusCode, ex.reason);
  }

  static isDiException(ex: any): ex is DIException {
    return ex.constructor == DIException;
  }
}
