import _ from 'lodash';
import luxon from 'luxon';
import eventHumanify from './eventHumanify.js';

const { DateTime } = luxon;

const uniqProcessor = eventHumanify;

const fullProcessor = (event, fromDate, periodDays = 0) => {
  const nowDT = fromDate instanceof DateTime
    ? fromDate
    : DateTime.fromMillis(fromDate);

  let day = 0;
  let events = [];
  do {
    const referenceDT = nowDT.plus({ day }).startOf('day');
    const processedEvent = eventHumanify(event, referenceDT.toMillis());
    const { days } = DateTime.fromMillis(processedEvent.startMS).diff(referenceDT, 'days').toObject();

    if (days < 1) {
      events = events.concat(processedEvent);
    }
    day += 1;
  } while (day < (periodDays + 1));

  return events;
};

export default (events, { uniq = true, periodDays = 0, fromDate = Date.now() }) => {
  const onlyUniq = (uniq && periodDays === 0);

  const eventProcessor = onlyUniq ? uniqProcessor : fullProcessor;

  const processedEvents = events
    .filter(({ type }) => type === 'VEVENT')
    .flatMap((event) => eventProcessor(event, fromDate, periodDays))
    .filter(({ isFinished }) => !isFinished);

  return onlyUniq
    ? _.sortBy(processedEvents, ['startMS'])
    : _.sortBy(processedEvents, ['referenceMS', 'startMS']);
};
