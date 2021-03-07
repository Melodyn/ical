import configValidator from '../../utils/configValidator.cjs';
import CronService from '../cron/CronService.js';
import QueueService from '../queue/QueueService.js';
import syncIcal from './syncIcal.js';
import syncWidget from './syncWidget.js';

const { envsMap } = configValidator;

const prodService = (server, reporter) => {
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

  return [icalTask, widgetTask].map((task) => new CronService(() => task.run(), 500, 1000));
};

const testService = () => [{ start: async () => {}, stop: async () => {} }];

const cronServiceFactory = (config, server, reporter) => {
  switch (config.NODE_ENV) {
    case envsMap.prod:
    case envsMap.stage:
      return prodService(server, reporter);
    default:
      return testService();
  }
};

export default cronServiceFactory;
