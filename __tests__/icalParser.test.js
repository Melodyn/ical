import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';
import icalParser from '../utils/icalParser.js';
import parsedICS from '../__fixtures__/calendar.js';
import calendars from '../__fixtures__/calendars.js';
import { buildCalendarLinks } from '../utils/helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const calendarLinks = buildCalendarLinks(calendars.world.calendarId);
const rawFixturePath = path.join(__dirname, '..', '__fixtures__', 'calendar.ics');
const calendarURL = new URL(calendarLinks.ical);
const rawFixtureBaseURL = calendarURL.origin;
const rawFixtureURLPath = calendarURL.pathname;
const rawFixtureURL = calendarLinks.ical;

const fixtures = {
  rawICS: '',
  parsedICS,
};

nock.disableNetConnect();

beforeAll(() => {
  fixtures.rawICS = fs.readFileSync(rawFixturePath, 'utf-8');

  nock(rawFixtureBaseURL).persist().get(rawFixtureURLPath).reply(200, fixtures.rawICS);
});

const cases = [
  ['fromICS', (parser) => parser.fromICS(fixtures.rawICS)],
  ['fromFile', (parser) => parser.fromFile(rawFixturePath)],
  ['fromURL', (parser) => parser.fromURL(rawFixtureURL)],
];

describe('Positive cases', () => {
  const parserCalendarTZ = icalParser('UTC');
  test.each(cases)('Calendar timezone: %s', async (caseName, handler) => {
    const result = await handler(parserCalendarTZ);

    expect(result).toEqual(parsedICS.Moscow);
  });

  test('Default timezone', async () => {
    const fixtureWithoutTZ = fixtures.rawICS.replace(/X-WR-TIMEZONE:.*/gm, '');
    const parserDetroitTZ = icalParser('America/Detroit');
    const result = await parserDetroitTZ.fromICS(fixtureWithoutTZ);

    expect(result).toEqual(parsedICS.Detroit);
  });

  const parserCustomTZ = icalParser('Europe/Moscow', 'UTC');
  test.each(cases)('Custom timezone: %s', async (caseName, handler) => {
    const result = await handler(parserCustomTZ);

    expect(result).toEqual(parsedICS.UTC);
  });
});
