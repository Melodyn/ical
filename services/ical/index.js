import prodService from './Prod/index.js';
import configValidator from '../../utils/configValidator.cjs';

const { envsMap } = configValidator;

const serviceFactory = (config, reporter) => {
  switch (config.NODE_ENV) {
    case envsMap.prod:
      return prodService({ milliseconds: config.SYNC_ICAL_TIME }, reporter);
    default:
      return prodService({ milliseconds: config.SYNC_ICAL_TIME }, reporter);
  }
};

export default serviceFactory;
