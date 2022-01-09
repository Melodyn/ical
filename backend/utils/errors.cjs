const { constants } = require('http2');

class ICalAppError extends Error {}

class ConfigValidationError extends ICalAppError {
  constructor(validationError) {
    super();
    this.name = 'Config validation error';
    this.message = validationError.errors.join('\n');
  }
}

class AuthError extends ICalAppError {
  constructor(message, code = '', params = {}) {
    super();
    this.name = 'Authorization error';
    this.message = message;
    this.params = params;
    this.code = ['auth', code].filter(x => x).join('.');
    this.statusCode = constants.HTTP_STATUS_UNAUTHORIZED;
  }
}

class ProcessingError extends ICalAppError {
  constructor(message, code = 'app', params = {}) {
    super();
    this.name = 'Processing error';
    this.message = message;
    this.params = params;
    this.code = code;
    this.statusCode = constants.HTTP_STATUS_BAD_REQUEST;
  }
}

class CronTaskError extends ICalAppError {
  constructor(originalError, params = {}) {
    super();
    this.name = !originalError ? 'CronTaskError' : originalError.name;
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
    this.params = params;
    this.message = `${originalError.message}, params: ${JSON.stringify(params, null, 2)}`;
    this.originalError = JSON.stringify(originalError);
  }
}

module.exports = {
  ICalAppError, ConfigValidationError, AuthError, CronTaskError,
};
