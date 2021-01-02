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
  test('Get empty main page', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/',
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/Приложению требуется установка/gim);
  });

  test('Get empty calendar', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/отсутствует календарь/gim);
  });

  test.each(Object.values(calendars))('Create calendar %o', async (calendar) => {
    const query = {
      ...users.admin,
      vk_group_id: calendar.clubId,
    };
    const { statusCode, headers } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        ...query,
        sign: buildSign(query, app.config.VK_PROTECTED_KEY),
      },
      payload: {
        calendarLink: calendar.calendarLink,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    expect(headers.location).toMatch(/\/calendar\?/gim);

    const clubCalendar = await calendarRepo.findOne({
      clubId: calendar.clubId,
      calendarId: calendar.calendarId,
    });
    expect(clubCalendar).toEqual(expect.objectContaining({
      id: expect.any(Number),
      clubId: calendar.clubId,
      calendarId: calendar.calendarId,
      extra: { calendarLink: calendar.calendarLink },
    }));
    calendar.id = clubCalendar.id;
  });

  test('Get calendar', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/iframe/gim);
  });

  test('Redirect to main', async () => {
    const { vk_group_id, ...userFields } = users.member;
    const { statusCode, headers } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: {
        ...userFields,
        sign: buildSign(userFields, app.config.VK_PROTECTED_KEY),
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    expect(headers.location).toEqual('/');
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

    expect(statusCode).not.toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/calendarLink/gim);

    const clubs = await calendarRepo.find({ calendarId: calendars.world.calendarId });
    expect(clubs).toHaveLength(Object.keys(calendars).length);
  });
});
