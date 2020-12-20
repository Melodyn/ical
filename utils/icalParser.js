import { promises as fs } from 'fs';
import axios from 'axios';
import ical from 'node-ical';
import { DateTime } from 'luxon';

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
      const value = !isDate
        ? rawValue
        : DateTime
          .fromISO(rawValue.toISOString())
          .setZone(timezone)
          .toISO();

      return [key, value];
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
