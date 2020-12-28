/* eslint-disable max-classes-per-file */

export class ICalAppError extends Error {}

export class ConfigValidationError extends ICalAppError {
  constructor(validationError) {
    super();
    this.name = 'Config validation error';
    this.message = validationError.errors.join('\n');
  }
}
