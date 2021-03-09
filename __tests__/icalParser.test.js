import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';
import * as icalParser from '../utils/icalParser.js';
import parsedICS from '../__fixtures__/calendar.js';
import calendars from '../__fixtures__/calendars.js';
import buildCalendarLinks from '../libs/ical/common/linkBuilder.js';

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
  test.each(cases)('Check calendar: %s', async (caseName, handler) => {
    const result = await handler(icalParser);

    expect(result).toEqual(parsedICS);
  });
});
