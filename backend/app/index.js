import 'reflect-metadata';
import { constants } from 'http2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// fastify
import fastify from 'fastify';
import fastifyAuth from 'fastify-auth';
import fastifyForm from 'fastify-formbody';
// libs
import Rollbar from 'rollbar';
import typeorm from 'typeorm';
import tz from 'countries-and-timezones';
import _ from 'lodash';
// app
import setTasks from '../libs/tasks/index.js';
import utils from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';
import errors from '../utils/errors.cjs';
import ICALService from '../libs/ical/ICALService.js';
import VKService from '../libs/vk/VKService.js';

const { createConnection } = typeorm;
const { configValidator } = utils;
const { ICalAppError, AuthError } = errors;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initServer = (config) => {
  const server = fastify({
    logger: {
      prettyPrint: config.IS_DEV_ENV,
      level: config.LOG_LEVEL,
    },
  });

  const openapi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'openapi-v1.json'), 'utf-8'));
  Object.entries(openapi.paths).forEach(([url, methods]) => {
    Object.entries(methods).forEach(([method, params]) => {
      const methodParams = {
        tags: [],
        security: openapi.security,
        ...params,
      };
      const { tags, security } = methodParams;

      const route = {
        method: method.toUpperCase(),
        url,
        preHandler(req, res, done) {
          if (security.length > 0) {
            this.auth([this.jwtAuth])(req, res, done);
          } else {
            done();
          }
        },
        handler(req, res) {
          res.code(200).send(`${method}\t${url}\ttags is: ${tags.join() || 'empty'}`);
        },
      };

      server.route(route);
    });
  });

  server.register(fastifyForm);
  server.register(fastifyAuth);

  return server;
};

const setAuth = (config, server) => {
  server.decorateRequest('user', null);
  server.decorateRequest('isAuthenticated', false);

  server.decorate('jwtAuth', (req, res, done) => {
    console.log('jwtAuth', req.url);
    done(new AuthError(`Access denied for user with role "${req.user}"`, req.query));
  });

  // const vkUserValidator = server.services.vkService.validateUser.bind(server.services.vkService);
  //
  // server.decorate('vkUserAuth', (req, res, done) => {
  //   const { isValid, user, error } = vkUserValidator(req.query);
  //   if (!isValid) {
  //     req.user = null;
  //     req.isAuthenticated = false;
  //     return done(error);
  //   }
  //   if (!user.groupId) {
  //     req.user = user;
  //     req.isAuthenticated = false;
  //     return done();
  //   }
  //
  //   req.user = user;
  //   req.isAuthenticated = true;
  //   return done();
  // });
  //
  // server.decorate('vkAdminAuth', (req, res, done) => {
  //   if (!req.isAuthenticated) {
  //     const { isValid, user, error } = vkUserValidator(req.query);
  //     if (!isValid) {
  //       return done(error);
  //     }
  //
  //     req.isAuthenticated = true;
  //     req.user = user;
  //   }
  //
  //   return req.user.isAdmin
  //     ? done()
  //     : done(new AuthError(`Access denied for user with role "${req.user.viewerGroupRole}"`, req.query));
  // });
};

const setServices = (config, server, reporter) => {
  const services = {
    vkService: new VKService(config),
    icalService: new ICALService(config),
    reporter,
  };

  server.decorate('services', services);
};

const initDatabase = () => ormconfig.then(createConnection);

const initReporter = (config, server) => {
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

  return config.IS_DEV_ENV ? console : rollbar;
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

const app = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const config = await configValidator(envName);
  const db = await initDatabase(config);
  const timezones = prepareTimezones(config);
  const server = initServer(config, db);
  const reporter = initReporter(config, server);
  setServices(config, server, reporter);
  setAuth(config, server);

  await db.runMigrations();
  server.decorate('db', db);
  server.decorate('config', config);
  server.decorate('timezones', timezones);

  const cronJobs = setTasks(config, server, reporter);

  const stop = async () => {
    server.log.info('Stop app', config);
    server.log.info('  Stop cron');
    await Promise.all(cronJobs.map((job) => job.stop()));
    server.log.info('  Disconnect db');
    await db.close();
    server.log.info('  Stop server');
    await server.close();
    server.log.info('App stopped');

    if (!config.IS_TEST_ENV) {
      process.exit(0);
    }
  };

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);

  await server.listen(config.PORT, config.HOST);
  await Promise.all(cronJobs.map((job) => job.start()));

  return {
    server,
    config,
    db,
    stop,
  };
};

export default app;
