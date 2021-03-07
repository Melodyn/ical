import typeorm from 'typeorm';
import errors from '../../utils/errors.cjs';

const { CronTaskError } = errors;
const {
  Not, IsNull, getConnection,
} = typeorm;

const updateCalendarData = (calendar, widgetError = null) => ({
  id: calendar.id,
  widgetToken: (widgetError === null) ? calendar.widgetToken : null,
  widgetSyncedAt: null,
  extra: {
    ...calendar.extra,
    widgetError,
    ...((widgetError === null) ? {} : { oldToken: calendar.widgetToken }),
  },
});

const syncWidget = (QueueService, icalService, vkService, reporter) => {
  const period = 5; // minutes
  const maxRequestTime = 10; // seconds
  const periodMS = period * 60 * 1000; // ms
  const maxRequestTimeMS = maxRequestTime * 1000; // ms
  const maxRecordsPerPeriod = periodMS / maxRequestTimeMS;

  const calendarRepo = getConnection().getRepository('Calendar');

  const filler = () => calendarRepo.find({
    where: {
      widgetToken: Not(IsNull()),
      widgetSyncedAt: Not(IsNull()),
    },
    order: {
      widgetSyncedAt: 'DESC',
    },
    take: maxRecordsPerPeriod,
  });

  const task = (calendar) => {
    const {
      widgetToken,
      clubId,
      timezone,
      extra: { ical },
    } = calendar;
    const events = icalService.toEvents(ical);
    const widget = vkService.createWidget(widgetToken, {
      clubId,
      timezone,
      events,
    });

    return vkService.updateWidget(widget)
      .then(() => updateCalendarData(calendar))
      .catch((err) => {
        const error = new CronTaskError(err, { clubId, widget });
        reporter.error(error);

        const newData = updateCalendarData(calendar, error);
        console.log('newData', newData);
        return newData;
      })
      .then((updatedCalendar) => calendarRepo.update(calendar.id, updatedCalendar));
  };

  return new QueueService(filler, task);
};

export default syncWidget;
