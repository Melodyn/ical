import clubs from '../__fixtures__/clubs.js';
import createApp from '../index.js';

let app;
let clubRepo;
let database;

beforeAll(async () => {
  app = await createApp(process.env.NODE_ENV);
  clubRepo = app.db.getRepository('Club');
  database = app.db.entityMetadatas.map(
    ({ name, tableName }) => [tableName, app.db.getRepository(name)],
  );
});

afterAll(async () => {
  if (app) {
    const rollbackPromises = database.map(([tableName, repo]) => repo
      .query(`TRUNCATE TABLE ${tableName};
      ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`));

    await Promise.all(rollbackPromises);
    await app.stop();
  }
});

describe('Positive cases', () => {
  test('Get empty calendar', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'GET',
      path: '/calendar',
    });

    expect(statusCode).toEqual(200);
    expect(JSON.parse(payload)).toEqual([]);
  });

  test('Create calendar', async () => {
    const { statusCode, payload } = await app.server.inject({
      method: 'POST',
      path: '/calendar',
      query: {
        vk_group_id: clubs.world.clubId,
      },
      payload: {
        calendarId: clubs.world.calendarId,
      },
    });

    expect(statusCode).toEqual(200);
    expect(payload).not.toBeFalsy();

    const club = await clubRepo.findOne({ calendarId: 'hello@world' });
    expect(club).toEqual(expect.objectContaining({
      id: expect.any(Number),
      clubId: clubs.world.clubId,
      calendarId: clubs.world.calendarId,
    }));
    clubs.world.id = club.id;
  });
});
