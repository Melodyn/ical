import 'reflect-metadata';
import { constants } from 'http2';
import fastify from 'fastify';
import Rollbar from 'rollbar';
import { createConnection } from 'typeorm';
import { configValidator } from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';
import routes from '../routes/calendar.js';

const initServer = (config) => {
  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  routes.forEach((route) => server.route(route));

  return server;
};

const initDatabase = () => ormconfig.then(createConnection);

const setRollbar = (config, server) => {
  const rollbar = new Rollbar({
    accessToken: config.ROLLBAR_TOKEN,
    enabled: config.IS_PROD_ENV || config.IS_STAGE_ENV,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  server.setErrorHandler((err, req, res) => {
    server.log.debug(err);
    rollbar.errorHandler()(err, req, res, (error) => {
      res.code(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send(`error: ${error.message}`);
    });
  });
};

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);
  const db = await initDatabase(config);
  const server = initServer(config, db);
  setRollbar(config, server);

  await db.runMigrations();
  server.decorate('db', db);

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
