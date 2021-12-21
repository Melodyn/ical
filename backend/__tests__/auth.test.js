import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import users from '../__fixtures__/users.js';
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
});

afterAll(async () => {
  if (app) {
    await app.stop();
  }
});

describe('Positive cases', () => {
  test.each(Object.keys(users))('Get token for %s', async (role) => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('auth'),
      payload: users[role],
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      token: expect.any(String),
    }));
    users[role].token = body.token;
  });

  test.each(Object.keys(users))('Is correct JWT for %s', (role) => {
    expect(() => jwt.verify(users[role].token, app.config.VK_PROTECTED_KEY)).not.toThrow();
  });

  test('Update calendar as admin', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.admin.token}`,
      },
      payload: {
        hello: 'world',
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_OK);
    expect(payload).not.toBeFalsy();
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
    expect(payload).not.toBeFalsy();
  });
});

describe('Negative cases', () => {
  test('Get token with incorrect sign', async () => {
    const { member: { token, ...userFields } } = users;
    userFields.sign = 'hello world';
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('auth'),
      payload: userFields,
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      code: expect.any(Number),
      message: expect.any(String),
    }));
  });

  test('Get calendar with random string as token', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: 'bearer hello-world',
      },
      payload: {
        hello: 'world',
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      code: expect.any(Number),
      message: expect.any(String),
    }));
  });

  test('Get calendar without header "Authorization"', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      payload: {
        hello: 'world',
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      code: expect.any(Number),
      message: expect.any(String),
    }));
  });

  test('Update calendar as not admin', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: buildPath('calendar'),
      headers: {
        Authorization: `bearer ${users.member.token}`,
      },
      payload: {
        hello: 'world',
      },
    });

    expect(statusCode).toEqual(constants.HTTP_STATUS_UNAUTHORIZED);
    expect(payload).not.toBeFalsy();

    const body = JSON.parse(payload);
    expect(body).toEqual(expect.objectContaining({
      code: expect.any(Number),
      message: expect.any(String),
    }));
  });
});
