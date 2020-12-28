import 'reflect-metadata';
import fastify from 'fastify';
// import { createConnection } from 'typeorm';
import { configValidator } from '../utils/configValidator.js';
// import Club from '../entity/Club.cjs';

const initServer = (config) => {
  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  server.get('/', (req, res) => {
    res.send(`vk_group_id is ${req.query.vk_group_id}`);
  });

  return server;
};

// const initDatabase = (config) => createConnection({
//   type: config.DB_TYPE,
//   host: config.DB_HOST,
//   port: config.DB_PORT,
//   username: config.DB_USER,
//   password: config.DB_PASS,
//   database: config.DB_NAME,
//   entities: [Club],
//   synchronize: false,
//   logging: ['query', 'error', 'migration'],
// });

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);
  const server = initServer(config);
  // const db = await initDatabase(config)
  //   .catch(console.error);

  await server.listen(config.PORT, config.HOST);

  const stop = async () => {
    server.log.info('Stop app', config);
    await server.close();
    server.log.info('App stopped');

    if (!config.IS_TEST_ENV) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', stop);

  return {
    server,
    stop,
  };
};

export default app;
