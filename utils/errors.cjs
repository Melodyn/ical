/* eslint-disable max-classes-per-file */
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

module.exports = { ICalAppError, ConfigValidationError, AuthError };
