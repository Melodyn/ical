import createApp from '../index.js';

let app;

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
});

afterAll(async () => {
  if (app) await app.stop();
});

describe('Positive cases', () => {
  test('Get empty main page', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
    });

    expect(statusCode).toEqual(200);
    expect(JSON.parse(payload)).toEqual([]);
  });

  test('Get main page with query', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        vk_group_id: 123456,
      },
      payload: {
        calendarId: 'hello@world',
      },
    });

    expect(statusCode).toEqual(200);
    expect(payload).toEqual('ok');
  });
});
