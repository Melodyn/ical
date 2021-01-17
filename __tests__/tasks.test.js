import { constants } from 'http2';
import fs from 'fs';
import nock from 'nock';
import typeorm from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import calendars from '../__fixtures__/calendars.js';
import users from '../__fixtures__/users.js';
import createApp from '../index.js';
import { buildSign } from '../utils/vkUserValidator.js';
import syncIcal from '../tasks/syncIcal.js';
import syncWidget from '../tasks/syncWidget.js';

let app;
let calendarRepo;
let database;

const { Not, IsNull } = typeorm;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawFixturePath = path.join(__dirname, '..', '__fixtures__', 'calendar.ics');

nock.disableNetConnect();

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
  calendarRepo = app.db.getRepository('Calendar');
  database = app.db.entityMetadatas.map(
    ({ name, tableName }) => [tableName, app.db.getRepository(name)],
  );
  Object.values(users).forEach((user) => {
    user.sign = buildSign(user, app.config.VK_PROTECTED_KEY);
  });

  const rawICS = fs.readFileSync(rawFixturePath, 'utf-8');
  nock(/calendar.google.com/).persist().get(/.*/).reply(200, rawICS);

  // Create calendars
  const createCalendarsPromises = Object
    .values(calendars)
    .map((calendar) => {
      const query = {
        ...users.admin,
        vk_group_id: calendar.clubId,
      };

      return app.server
        .inject({
          method: 'POST',
          path: '/calendar',
          query: {
            ...query,
            sign: buildSign(query, app.config.VK_PROTECTED_KEY),
          },
          payload: {
            calendarId: calendar.calendarId,
            timezone: calendar.timezone,
          },
        })
        .then(() => calendarRepo.findOne({
          clubId: calendar.clubId,
          calendarId: calendar.calendarId,
        }))
        .then((clubCalendar) => {
          calendar.id = clubCalendar.id;
        });
    });
  await Promise.all(createCalendarsPromises);
});

afterAll(async () => {
  if (app) {
    const rollbackPromises = database.map(([tableName, repo]) => repo
      .query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY;`));

    await Promise.all(rollbackPromises);
    await app.stop();
  }
});

describe('Positive cases', () => {
  test('Set widgetToken', async () => {
    const { statusCode } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: users.admin,
      payload: {
        calendarId: calendars.world.calendarId,
        timezone: calendars.world.timezone,
        widgetToken: calendars.world.widgetToken,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    const clubCalendar = await calendarRepo.findOne({
      clubId: calendars.world.clubId,
      calendarId: calendars.world.calendarId,
    });
    expect(clubCalendar).toEqual(expect.objectContaining({
      widgetToken: calendars.world.widgetToken,
      widgetSyncedAt: null,
      extra: {},
    }));
  });

  test('Sync ical', async () => {
    await syncIcal(app.config);

    const calendarsWithWidget = await calendarRepo.find({
      widgetToken: Not(IsNull()),
    });

    calendarsWithWidget.forEach((clubCalendar) => {
      expect(clubCalendar).toEqual(expect.objectContaining({
        widgetSyncedAt: expect.any(Date),
        extra: expect.objectContaining({
          ical: expect.any(Array),
          icalError: null,
        }),
      }));
    });
  });

  test('Sync widget', async () => {
    let requestURL;
    nock(/api.vk.com/).persist().get(/.*/).reply(200, (uri) => {
      requestURL = new URL(uri, 'https://api.vk.com');
      return { data: { response: 1 } };
    });

    await expect(syncWidget(app.config)).resolves.not.toThrow();
    const searchParams = Object.fromEntries(requestURL.searchParams);

    expect(searchParams).toEqual(expect.objectContaining({
      access_token: expect.any(String),
      type: expect.any(String),
      code: expect.any(String),
    }));

    const widgetJSON = searchParams.code.replace(/(return|;)/g, '').trim();
    const widget = JSON.parse(widgetJSON);

    expect(widget).toEqual(expect.objectContaining({
      title: expect.any(String),
      more: expect.any(String),
      rows: expect.any(Array),
    }));
  });
});
