import luxon from 'luxon';
import typeorm from 'typeorm';
import { buildCalendarLinks } from '../../../utils/helpers.js';
import * as parse from '../../../utils/icalParser.js';
import errors from '../../../utils/errors.cjs';

const { CronTaskError } = errors;

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const updateCalendarData = (calendar, ical, icalError = null) => ({
  id: calendar.id,
  widgetSyncedAt: (icalError === null) ? calendar.updatedAt : null,
  extra: {
    ...calendar.extra,
    ical,
    icalError,
  },
});

const syncIcal = async (period, reporter) => {
  const calendarRepo = getConnection().getRepository('Calendar');
  const updateDate = DateTime.local().minus(period).toSQL();

  const calendarsWithTokens = await calendarRepo.find({
    widgetToken: Not(IsNull()),
    updatedAt: LessThan(updateDate),
  });

  const parserPromises = calendarsWithTokens.map((calendar) => {
    const { ical } = buildCalendarLinks(calendar.calendarId);

    return parse
      .fromURL(ical)
      .then((data) => updateCalendarData(calendar, data))
      .catch((err) => {
        const error = new CronTaskError(err, {
          icalLink: ical,
          clubId: calendar.clubId,
          calendarId: calendar.calendarId,
        });
        reporter.error(error);

        return updateCalendarData(calendar, null, err);
      });
  });

  return Promise.all(parserPromises)
    .then((calendars) => calendars.map((calendar) => calendarRepo.update(calendar.id, calendar)))
    .then((queries) => Promise.all(queries));
};

export default syncIcal;
