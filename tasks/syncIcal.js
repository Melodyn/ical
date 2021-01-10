import luxon from 'luxon';
import typeorm from 'typeorm';
import { buildCalendarLinks } from '../utils/helpers.js';
import * as parse from '../utils/icalParser.js';

const { DateTime } = luxon;
const {
  Not, IsNull, LessThan, getConnection,
} = typeorm;

const updateCalendarData = (calendar, ical, icalError = null) => ({
  ...calendar,
  widgetSyncedAt: (icalError === null) ? calendar.updatedAt : null,
  extra: {
    ...calendar.extra,
    ical,
    icalError,
  },
});

const syncIcal = async (period) => {
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
      .catch((err) => updateCalendarData(calendar, null, err));
  });

  return Promise.all(parserPromises)
    .then((calendars) => calendars.map((calendar) => calendarRepo.update(calendar.id, calendar)))
    .then((queries) => Promise.all(queries));
};

export default syncIcal;
