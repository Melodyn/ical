import typeorm from 'typeorm';
import errors from '../../utils/errors.cjs';

const { CronTaskError } = errors;

const { getConnection } = typeorm;

const updateCalendarData = (calendar, ical = [], icalError = null) => ({
  id: calendar.id,
  widgetSyncedAt: (icalError === null) ? calendar.updatedAt : null,
  extra: {
    ...calendar.extra,
    ical,
    icalError,
  },
});

const syncIcal = (QueueService, icalService, reporter) => {
  const period = 5; // minutes
  const maxRequestTime = 10; // seconds
  const periodMS = period * 60 * 1000; // ms
  const maxRequestTimeMS = maxRequestTime * 1000; // ms
  const maxRecordsPerPeriod = periodMS / maxRequestTimeMS;

  const calendarRepo = getConnection().getRepository('Calendar');

  const filler = () => calendarRepo.find({
    order: {
      updatedAt: 'DESC',
    },
    take: maxRecordsPerPeriod,
  });

  const task = (calendar) => icalService.load(calendar.calendarId)
    .then((data) => updateCalendarData(calendar, data))
    .catch((err) => {
      const error = new CronTaskError(err, {
        clubId: calendar.clubId,
        calendarId: calendar.calendarId,
      });
      reporter.error(error);

      return updateCalendarData(calendar, null, err);
    })
    .then((updatedCalendar) => calendarRepo.update(calendar.id, updatedCalendar));

  return new QueueService(filler, task);
};

export default syncIcal;
