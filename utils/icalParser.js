import { promises as fs } from 'fs';
import axios from 'axios';
import ical from 'node-ical';
import luxon from 'luxon';

const { DateTime } = luxon;

const timezoneRegex = new RegExp('^X-WR-TIMEZONE:(?<timezone>.+)$', 'm');

const getCalendarTimezone = (fileContent, defaultTimezone) => {
  const calendarTimezone = fileContent.match(timezoneRegex);
  const { groups: { timezone = defaultTimezone } = {} } = calendarTimezone || {};

  return timezone;
};

const processDates = (data, timezone) => {
  const rawEvents = Object.values(data);

  return rawEvents.map((event) => {
    const eventEntries = Object.entries(event).map(([key, rawValue]) => {
      const isDate = (rawValue instanceof Date);

      if (!isDate) return [key, rawValue];

      const date = DateTime.fromISO(rawValue.toISOString()).setZone(timezone);
      const formattedDate = (event.datetype === 'date' && (key === 'start' || key === 'end'))
        ? date.toISODate()
        : date.toISO();

      return [key, formattedDate];
    });

    return Object.fromEntries(eventEntries);
  });
};

const fromICS = (rawData, defaultTimezone) => ical.async.parseICS(rawData)
  .then((parsedData) => processDates(parsedData, getCalendarTimezone(rawData, defaultTimezone)));

const fromFile = (filepath, defaultTimezone) => fs.readFile(filepath, 'utf-8')
  .then((rawData) => fromICS(rawData, defaultTimezone));

const fromURL = (url, params, defaultTimezone) => axios.get(url, params)
  .then(({ data }) => fromICS(data, defaultTimezone));

export default (defaultTimezone = 'Europe/Moscow') => ({
  fromFile: (filepath) => fromFile(filepath, defaultTimezone),
  fromURL: (url, params = {}) => fromURL(url, params, defaultTimezone),
  fromICS: (rawData) => fromICS(rawData, defaultTimezone),
});
