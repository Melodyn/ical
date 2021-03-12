import { constants } from 'http2';
import fs from 'fs';
import nock from 'nock';
import typeorm from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import calendars from '../__fixtures__/calendars.js';
import users from '../__fixtures__/users.js';
import createApp from '../index.js';
import { buildSign } from '../libs/vk/common/userValidator.js';
import syncIcal from '../libs/tasks/syncIcal.js';
import syncWidget from '../libs/tasks/syncWidget.js';
import QueueService from '../libs/queue/QueueService.js';

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
      extra: {
        ical: expect.any(Array),
      },
    }));
  });

  test('Sync ical', async () => {
    const sync = syncIcal(QueueService, app.server.services.icalService);
    await sync.run(); // init queue
    const syncResult = await sync.run(); // sync

    expect(syncResult).toEqual(expect.objectContaining({
      affected: 1,
    }));

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
    const sync = syncWidget(
      QueueService,
      app.server.services.icalService,
      app.server.services.vkService,
    );
    await sync.run(); // init queue
    const syncResult = await sync.run(); // sync

    expect(syncResult).toEqual(expect.objectContaining({
      affected: 1,
    }));

    const clubCalendar = await calendarRepo.findOne({
      clubId: calendars.world.clubId,
      calendarId: calendars.world.calendarId,
    });
    expect(clubCalendar).toEqual(expect.objectContaining({
      widgetSyncedAt: null,
      widgetToken: calendars.world.widgetToken,
      extra: expect.objectContaining({
        widgetError: null,
      }),
    }));
  });
});
