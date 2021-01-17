import 'reflect-metadata';
import { constants } from 'http2';
import path from 'path';
// fastify
import fastify from 'fastify';
import fastifyAuth from 'fastify-auth';
import fastifyForm from 'fastify-formbody';
import fastifyStatic from 'fastify-static';
// libs
import Rollbar from 'rollbar';
import pointOfView from 'point-of-view';
import pug from 'pug';
import { createConnection } from 'typeorm';
import tz from 'countries-and-timezones';
import _ from 'lodash';
import { CronJob } from 'cron';
// app
import { configValidator } from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';
import routes from '../routes/calendar.js';
import { createValidator as createVkUserValidator } from '../utils/vkUserValidator.js';
import errors from '../utils/errors.cjs';
import syncIcal from '../tasks/syncIcal.js';
import syncWidget from '../tasks/syncWidget.js';

const { ICalAppError, AuthError } = errors;

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

const setAuth = (config, server) => {
  server.decorateRequest('user', null);
  server.decorateRequest('isAuthenticated', false);

  const vkUserValidator = createVkUserValidator(config.VK_PROTECTED_KEY, config.VK_APP_ADMIN_ID);

  server.decorate('vkUserAuth', (req, res, done) => {
    const { isValid, user, error } = vkUserValidator(req);
    if (!isValid) {
      req.user = null;
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

const setStatic = (config, server) => {
  server.register(fastifyForm);
  server.register(fastifyStatic, {
    root: path.resolve(config.STATIC_DIR),
  });
  server.register(pointOfView, {
    engine: {
      pug,
    },
    includeViewExtension: true,
    templates: path.resolve(config.STATIC_DIR, 'templates'),
  });
  server.decorateReply('render', function render(template, values = {}) {
    const { user } = this.request;
    this.view(template, {
      user,
      values,
      gon: {
        user: {
          isAppAdmin: true,
          isAdmin: true,
          ...user,
        },
        app: {
          isProd: config.IS_PROD_ENV,
          page: template,
        },
      },
    });
  });
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

const prepareTimezones = (config) => {
  const formatTimezone = ({ name, utcOffsetStr }) => ({ name, offset: utcOffsetStr });
  const allTimezones = Object.values(tz.getAllTimezones());
  const timezones = allTimezones.map(formatTimezone);
  const defaultTimezone = allTimezones.find(({ name }) => name === config.DEFAULT_TIMEZONE);

  return {
    default: formatTimezone(defaultTimezone),
    all: _.sortBy(timezones, ['offset', 'name']),
  };
};

const initCron = (config) => (config.IS_PROD_ENV
  ? new CronJob(
    config.CRON_ICAL_TIME,
    async () => {
      await syncIcal({ milliseconds: config.SYNC_ICAL_TIME })
        .then((res) => console.log('syncIcal then', (new Date()).toISOString(), res))
        .catch((err) => console.error('syncIcal catch', (new Date()).toISOString(), err));

      await syncWidget({ milliseconds: config.SYNC_ICAL_TIME })
        .then((res) => console.log('syncWidget then', (new Date()).toISOString(), res))
        .catch((err) => console.error('syncWidget catch', (new Date()).toISOString(), err));
    },
    null,
    true,
    null,
    null,
    true,
  )
  : {
    start: () => {},
    stop: () => {},
  });

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);
  const db = await initDatabase(config);
  const timezones = prepareTimezones(config);
  const server = initServer(config, db);
  const cronJob = initCron(config);
  setRollbar(config, server);
  setAuth(config, server);
  setStatic(config, server);

  await db.runMigrations();
  server.decorate('db', db);
  server.decorate('config', config);
  server.decorate('timezones', timezones);

  await server.listen(config.PORT, config.HOST);
  cronJob.start();

  const stop = async () => {
    server.log.info('Stop app', config);
    server.log.info('\tStop cron');
    cronJob.stop();
    server.log.info('\tDisconnect db');
    await db.close();
    server.log.info('\tStop server');
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
