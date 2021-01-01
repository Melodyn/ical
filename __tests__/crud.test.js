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
  test('Get empty calendar', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(200);
    expect(JSON.parse(payload)).toEqual([]);
  });

  test.each(Object.values(calendars))('Create calendar %o', async (calendar) => {
    const query = {
      ...users.admin,
      vk_group_id: calendar.clubId,
    };
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        ...query,
        sign: buildSign(query, app.config.VK_PROTECTED_KEY),
      },
      payload: {
        calendarId: calendar.calendarId,
      },
    });

    expect(statusCode).toEqual(200);
    expect(payload).not.toBeFalsy();

    const club = await calendarRepo.findOne({ calendarId: calendar.calendarId });
    expect(club).toEqual(expect.objectContaining({
      id: expect.any(Number),
      clubId: calendar.clubId,
      calendarId: calendar.calendarId,
    }));
    calendar.id = club.id;
  });

  test('Get calendars', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(200);
    expect(JSON.parse(payload)).not.toEqual([]);
  });
});

describe('Negative cases', () => {
  test('Create duplicate', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        ...users.admin,
        vk_group_id: calendars.world.clubId,
      },
      payload: {
        calendarId: calendars.world.calendarId,
      },
    });

    expect(statusCode).not.toEqual(200);
    expect(payload.includes('error')).not.toBeFalsy();

    const clubs = await calendarRepo.find({ calendarId: calendars.world.calendarId });
    expect(clubs).toHaveLength(1);
  });
});
