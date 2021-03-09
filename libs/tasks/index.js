import configValidator from '../../utils/configValidator.cjs';
import QueueService from '../queue/QueueService.js';
import CronService from '../cron/CronService.js';
import syncIcal from './syncIcal.js';
import syncWidget from './syncWidget.js';

const { envsMap } = configValidator;

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

  return [icalTask, widgetTask].map((task) => new CronService(
    () => task.run(),
    config.CRON_SYNC_PERIOD,
    config.CRON_SYNC_DELAY,
  ));
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
