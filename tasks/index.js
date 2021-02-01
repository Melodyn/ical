import cron from 'cron';
import syncIcal from './syncIcal.js';
import syncWidget from './syncWidget.js';
import configValidator from '../utils/configValidator.cjs';

const { envsMap } = configValidator;
const { CronJob } = cron;

const tasks = {
  syncIcal,
  syncWidget,
};

const cronServiceFactory = (config, reporter) => {
  switch (config.NODE_ENV) {
    case envsMap.test:
      return [{ start: () => {}, stop: () => {} }];
    default:
      return Object.entries(tasks).map(([name, task]) => new CronJob(
        config.CRON_ICAL_TIME,
        () => task(config, reporter)
          .then((result) => reporter.info(`${name}: ${JSON.stringify(result)}`))
          .catch((err) => reporter.error(err)),
      ));
  }
};

export default cronServiceFactory;
