import cron from 'cron';
import configValidator from '../../utils/configValidator.cjs';
import QueueService from '../queue/QueueService.js';
import syncIcal from './syncIcal.js';
import syncWidget from './syncWidget.js';

const { envsMap } = configValidator;
const { CronJob } = cron;

const prodService = (config, server, reporter) => {
  const icalTask = syncIcal(
    QueueService,
    server.services.icalService,
    reporter,
  );
  const widgetTask = syncWidget(
    QueueService,
    server.services.icalService,
    server.services.vkService,
    reporter,
  );

  return [icalTask, widgetTask].map((task) => new CronJob(config.CRON_ICAL_TIME, () => task.run()));
};

const testService = () => [{ start: async () => {}, stop: async () => {} }];

const cronServiceFactory = (config, server, reporter) => {
  switch (config.NODE_ENV) {
    case envsMap.prod:
    case envsMap.stage:
      return prodService(config, server, reporter);
    default:
      return testService();
  }
};

export default cronServiceFactory;
