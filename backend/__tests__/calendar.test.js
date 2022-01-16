import { constants } from 'http2';
import users from '../__fixtures__/users.js';
import calendars from '../__fixtures__/calendars.js';
import { buildSign } from '../libs/vk/common/userValidator.js';
import createApp from '../index.js';

let app;
let buildPath;

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
  Object.values(users).forEach((user) => {
    user.sign = buildSign(user, app.config.VK_PROTECTED_KEY);
  });
  buildPath = (...paths) => `${app.config.API_PREFIX}v1/${paths.join('/')}`;

  const promises = Object.keys(users).map((role) => app.server
    .inject({
      method: 'POST',
      path: buildPath('auth'),
      payload: users[role],
    })
    .then(({ payload }) => JSON.parse(payload))
    .then((body) => {
      users[role].token = body.token;
    }));
  await Promise.all(promises);
});

afterAll(async () => {
  if (app) {
    await app.stop();
  }
});

describe('Positive cases', () => {
  test.each(Object.keys(calendars))('Create calendar as admin', async (name) => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.admin.token}`,
      },
      payload: {
        calendarId: calendars[name].calendarId,
        timezone: calendars[name].timezone,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      action: 'create',
      user: expect.any(Object),
    }));
  });

  test('Get calendar as member', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.member.token}`,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      action: 'read',
      user: expect.any(Object),
    }));
  });
});

describe('Negative cases', () => {
  test('Create calendar without body', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.admin.token}`,
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      name: expect.any(String),
      message: expect.any(String),
    }));
  });

  test('Create calendar with incorrect body', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.admin.token}`,
      },
      payload: {
        calendarId: 'hello',
        timezone: 'lol',
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_BAD_REQUEST);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      name: expect.any(String),
      message: expect.any(String),
      params: expect.objectContaining({
        calendarId: expect.any(String),
        timezone: expect.any(String),
      }),
    }));
  });
});
