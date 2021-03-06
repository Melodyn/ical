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
  constructor(message, params = {}) {
    super();
    this.name = 'Authorization error';
    this.message = message;
    this.params = params;
    this.statusCode = constants.HTTP_STATUS_UNAUTHORIZED;
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
  }
}

module.exports = {
  ICalAppError, ConfigValidationError, AuthError, CronTaskError,
};
