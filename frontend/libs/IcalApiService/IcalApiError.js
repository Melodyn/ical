import isObject from 'lodash/isObjectLike';
import has from 'lodash/has';

class IcalApiError extends Error {
  static isApiError(err) {
    return isObject(err)
      && has(err, 'name')
      && has(err, 'message')
      && has(err, 'params')
      && isObject(err.params);
  }

  constructor(errorObject) {
    super(errorObject.message);
    this.name = errorObject.name;
    this.params = errorObject.params;
  }
}

export default IcalApiError;
