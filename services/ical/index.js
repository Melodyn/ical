import prodService from './Prod/index.js';
import configValidator from '../../utils/configValidator.cjs';

const { envsMap } = configValidator;

const serviceFactory = (config) => {
  switch (config.NODE_ENV) {
    case envsMap.prod:
      return prodService({ milliseconds: config.SYNC_ICAL_TIME });
    default:
      return prodService({ milliseconds: config.SYNC_ICAL_TIME });
  }
};

export default (config) => serviceFactory(config);
