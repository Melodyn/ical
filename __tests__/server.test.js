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
      path: '/',
    });

    expect(statusCode).toEqual(200);
    expect(payload).toEqual('');
  });

  test('Get main page with query', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/',
      query: {
        vk_group_id: 'Hello',
      },
    });

    expect(statusCode).toEqual(200);
    expect(payload).toEqual('Hello');
  });
});
