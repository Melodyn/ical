import { constants } from 'http2';
import users from '../__fixtures__/users.js';
import calendars from '../__fixtures__/calendars.js';
import { buildSign } from '../utils/vkUserValidator.js';
import createApp from '../index.js';

let app;
let database;

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
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
  test('Route for all roles, user role "member"', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.member,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).not.toBeFalsy();
  });

  test('Route for all roles, user role "admin"', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: users.admin,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).not.toBeFalsy();
  });

  test('Route for role "admin"', async () => {
    const { statusCode, headers } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: users.admin,
      payload: {
        calendarId: calendars.world.calendarId,
        timezone: calendars.world.timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_FOUND);
    expect(headers.location).toMatch(/\/calendar\?/gim);
  });
});

describe('Negative cases', () => {
  test('Route for all roles, without query', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: {},
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).toMatch(/"sign" is missing/gim);
  });

  test('Route for all roles, incorrect sign', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
      query: {
        ...users.member,
        sign: users.admin,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).toMatch(/Incorrect sign/gim);
  });

  test('Route for role "admin", user role "member"', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: users.member,
      payload: {
        calendarId: calendars.world.calendarId,
        timezone: calendars.world.timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).toMatch(/Access denied/gim);
  });
});
