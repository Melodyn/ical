import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';
import icalParser from '../utils/icalParser.js';
import parsedICS from '../__fixtures__/calendar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rawFixturePath = path.join(__dirname, '..', '__fixtures__', 'calendar.ics');
const rawFixtureBaseURL = 'https://calendar.google.com';
const rawFixtureURLPath = '/calendar/ical/ob1gcsbo877671s4295f693nv0%40group.calendar.google.com/public/basic.ics';
const rawFixtureURL = rawFixtureBaseURL + rawFixtureURLPath;

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
  const parserDefaultTZ = icalParser();

  test.each(cases)('Default timezone: %s', async (caseName, handler) => {
    const result = await handler(parserDefaultTZ);

    expect(result).toEqual(parsedICS);
  });
});
