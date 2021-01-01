import 'reflect-metadata';
import { constants } from 'http2';
// fastify
import fastify from 'fastify';
import fastifyAuth from 'fastify-auth';
import fastifyForm from 'fastify-formbody';
// libs
import Rollbar from 'rollbar';
import { createConnection } from 'typeorm';
// app
import { configValidator } from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';
import routes from '../routes/calendar.js';
import { createValidator as createVkUserValidator } from '../utils/vkUserValidator.js';
import errors from '../utils/errors.cjs';

const { ICalAppError, AuthError } = errors;

const initServer = (config) => {
  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  server.register(fastifyForm);
  routes.forEach((route) => server.route(route));

  return server;
};

const setAuth = (config, server) => {
  server.decorateRequest('user', '');
  server.decorateRequest('isAuthenticated', false);
  const vkUserValidator = createVkUserValidator(config.VK_PROTECTED_KEY);

  server.decorate('vkUserAuth', (req, res, done) => {
    const { isValid, user, error } = vkUserValidator(req);
    if (!isValid) {
      req.user = '';
      req.isAuthenticated = false;
      return done(error);
    }
    if (!user.groupId) {
      res.redirect('/');
    }

    req.user = user;
    req.isAuthenticated = true;
    return done();
  });

  server.decorate('vkAdminAuth', (req, res, done) => {
    if (!req.isAuthenticated) {
      const { isValid, user, error } = vkUserValidator(req);
      if (!isValid) {
        return done(error);
      }

      req.isAuthenticated = true;
      req.user = user;
    }

    return req.user.isAdmin
      ? done()
      : done(new AuthError(`Access denied for user with role "${req.user.viewerGroupRole}"`, req.query));
  });

  server.register(fastifyAuth);
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
      if (!(error instanceof ICalAppError)) {
        return res.code(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send(`error: ${error.message}`);
      }

      const message = [error.message, `params: ${JSON.stringify(error.params, null, 2)}`].join('\n');
      return res.code(error.statusCode).send(`error: ${message}`);
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
  setAuth(config, server);

  await db.runMigrations();
  server.decorate('db', db);
  server.decorate('config', config);

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
    config,
    db,
    stop,
  };
};

export default app;
