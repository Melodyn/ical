import 'reflect-metadata';
import fastify from 'fastify';
import { createConnection } from 'typeorm';
import { configValidator } from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';

const initServer = (config, db) => {
  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  server.get('/', async (req, res) => {
    res.send(`vk_group_id is ${req.query.vk_group_id}`);
  });

  server.get('/calendar', async (req, res) => {
    const clubRepository = db.getRepository('Club');
    const clubs = await clubRepository.find();
    res.send(JSON.stringify(clubs));
  });

  server.post('/calendar', async (req, res) => {
    const clubRepository = db.getRepository('Club');
    await clubRepository.save({
      clubId: 12345,
      calendarId: 'hello@world',
    })
      .catch(console.error);
    res.send('ok');
  });

  return server;
};

const initDatabase = () => ormconfig.then(createConnection);

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);
  const db = await initDatabase(config);
  const server = initServer(config, db);

  await db.runMigrations();
  await server.listen(config.PORT, config.HOST);

  const stop = async () => {
    server.log.info('Stop app', config);
    await db.close();
    await server.close();
    server.log.info('App stopped');

    if (!config.IS_TEST_ENV) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', stop);

  return {
    server,
    db,
    stop,
  };
};

export default app;
