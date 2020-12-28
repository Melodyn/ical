/* eslint-disable max-classes-per-file */

class ICalAppError extends Error {}

class ConfigValidationError extends ICalAppError {
  constructor(validationError) {
    super();
    this.name = 'Config validation error';
    this.message = validationError.errors.join('\n');
  }
}

module.exports = { ICalAppError, ConfigValidationError };
