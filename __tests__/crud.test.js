/* eslint-disable jest/no-commented-out-tests */
import { constants } from 'http2';
import nock from 'nock';
import calendars from '../__fixtures__/calendars.js';
import users from '../__fixtures__/users.js';
import createApp from '../index.js';
import { buildSign } from '../libs/vk/common/userValidator.js';

let app;
let calendarRepo;
let database;

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

  nock(/.*/).persist().get(/.*/).reply((uri) => [
    uri.includes('private')
      ? 404
      : 200,
  ]);
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
  test('Get main page', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/',
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/Google календарь и виджет в сообщество/gim);
  });

  test('Get help page', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/help',
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/О приложении/gim);
  });

  test('Get install page', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/install',
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/Необходимо выбрать сообщество/gim);
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
        calendarId: calendar.calendarId,
        timezone: calendar.timezone,
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
      widgetToken: null,
      timezone: calendar.timezone,
      extra: {
        ical: expect.any(Array),
      },
    }));
    calendar.id = clubCalendar.id;
  });

  test('Update calendar', async () => {
    const { statusCode } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: users.admin,
      payload: {
        calendarId: calendars.world.calendarId,
        timezone: calendars.kitty.timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    const clubCalendar = await calendarRepo.findOne({
      clubId: calendars.world.clubId,
      calendarId: calendars.world.calendarId,
    });
    expect(clubCalendar).toEqual(expect.objectContaining({
      id: calendars.world.id,
      clubId: calendars.world.clubId,
      calendarId: calendars.world.calendarId,
      timezone: calendars.kitty.timezone,
    }));
  });

  test('Get calendar as member', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/Мероприятия на месяц./gim);
  });

  // заглушено из-за отсутствия редиректов в мобильном приложении
  // test('Redirect to main', async () => {
  //   const { vk_group_id, ...userFields } = users.member;
  //   const { statusCode, headers } = await app.server.inject({
  //     method: 'GET',
  //     path: '/calendar',
  //     query: {
  //       ...userFields,
  //       sign: buildSign(userFields, app.config.VK_PROTECTED_KEY),
  //     },
  //   });
  //
  //   expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
  //   expect(headers.location).toEqual('/install');
  // });
  test('Render main', async () => {
    const { vk_group_id, ...userFields } = users.member;
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: {
        ...userFields,
        sign: buildSign(userFields, app.config.VK_PROTECTED_KEY),
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).toMatch(/Необходимо выбрать сообщество/gim);
  });
});

describe('Negative cases', () => {
  test('Create duplicate', async () => {
    const { statusCode, headers } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        ...users.admin,
        vk_group_id: calendars.world.clubId,
      },
      payload: {
        calendarId: calendars.world.calendarId,
        timezone: calendars.world.timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    expect(headers.location).toMatch(/\/calendar\?/gim);

    const dbCalendars = await calendarRepo.find();
    expect(dbCalendars).toHaveLength(Object.keys(calendars).length);
  });

  test('Create private calendar', async () => {
    const [, domain] = calendars.world.calendarId.split('@');
    const { statusCode, headers } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        ...users.admin,
        vk_group_id: calendars.world.clubId,
      },
      payload: {
        calendarId: `private@${domain}`,
        timezone: calendars.world.timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    expect(headers.location).toMatch(/\/calendar\?/gim);

    const dbCalendars = await calendarRepo.find();
    expect(dbCalendars).toHaveLength(Object.keys(calendars).length);
  });
});
