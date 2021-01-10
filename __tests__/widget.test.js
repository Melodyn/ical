import { constants } from 'http2';
import calendars from '../__fixtures__/calendars.js';
import users from '../__fixtures__/users.js';
import createApp from '../index.js';
import { buildSign } from '../utils/vkUserValidator';

let app;
let calendarRepo;
let database;

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
  calendarRepo = app.db.getRepository('Calendar');
  database = app.db.entityMetadatas.map(
    ({ name, tableName }) => [tableName, app.db.getRepository(name)],
  );
  Object.values(users).forEach((user) => {
    user.sign = buildSign(user, app.config.VK_PROTECTED_KEY);
  });

  // Create calendars
  const createCalendarsPromises = Object
    .values(calendars)
    .map((calendar) => {
      const query = {
        ...users.admin,
        vk_group_id: calendar.clubId,
      };

      return app.server.inject({
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
});
