import luxon from 'luxon';
import typeorm from 'typeorm';
import _ from 'lodash';
import { prepareEvents } from '../utils.js';

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const syncWidget = async (QueueService, icalService, vkService, reporter) => {
  const period = 5; // minutes
  const maxRequestTime = 10; // seconds
  const periodMS = period * 60 * 1000; // ms
  const maxRequestTimeMS = maxRequestTime * 1000; // ms
  const maxRecordsPerPeriod = periodMS / maxRequestTimeMS;

  const calendarRepo = getConnection().getRepository('Calendar');

  const filler = () => calendarRepo.find({
    where: {
      widgetToken: Not(IsNull()),
    },
    order: {
      widgetSyncedAt: 'DESC',
    },
    take: maxRecordsPerPeriod,
  });

  // TODO task
};

export default syncWidget;
