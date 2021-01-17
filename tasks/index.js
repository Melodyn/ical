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

const prepareTask = (config, task, name) => {
  if (config.IS_PROD_ENV || config.IS_DEV_ENV) {
    return task(config)
      .then((res) => {
        console.log(`${name} then`, (new Date()).toISOString(), res);
        return res;
      })
      .catch((err) => {
        console.error(`${name} catch`, (new Date()).toISOString(), err);
        throw err;
      });
  }
  return task(config);
};

const cronServiceFactory = (config) => {
  switch (config.NODE_ENV) {
    case envsMap.test:
      return [{ start: () => {}, stop: () => {} }];
    default:
      return Object.entries(tasks).map(([name, task]) => new CronJob(
        config.CRON_ICAL_TIME,
        () => prepareTask(config, task, name),
      ));
  }
};

export default (config) => cronServiceFactory(config);
