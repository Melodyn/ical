import 'reflect-metadata';
import { constants } from 'http2';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
// fastify
import fastify from 'fastify';
import fastifyAuth from 'fastify-auth';
// libs
import Rollbar from 'rollbar';
import typeorm from 'typeorm';
import tz from 'countries-and-timezones';
import _ from 'lodash';
// app
import * as appControllers from '../controllers/index.js';
import setTasks from '../libs/tasks/index.js';
import utils from '../utils/configValidator.cjs';
import ormconfig from '../ormconfig.cjs';
import errors from '../utils/errors.cjs';
import ICALService from '../libs/ical/ICALService.js';
import VKService from '../libs/vk/VKService.js';
import jwtService from '../libs/jwt/index.js';

const { methodActionMap } = appControllers;
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

  server.register(fastifyAuth);

  return server;
};

const setRoutes = async (config, server) => {
  const fileStats = await fs.readdir(path.resolve(__dirname, '..'))
    .then((filenames) => filenames
      .filter((filename) => filename.startsWith('openapi-') && filename.endsWith('.json'))
      .map((filename) => ({
        filename,
        filepath: path.resolve(__dirname, '..', filename),
        version: filename.match(/v\d+/)[0],
      })));

  const readFilePromises = fileStats.map(({ filepath, version }) => fs.readFile(filepath, 'utf-8')
    .then((data) => JSON.parse(data))
    .then((openapi) => ({ openapi, version })));
  const files = await Promise.all(readFilePromises);

  files.forEach(({ openapi, version }) => Object.entries(openapi.paths)
    .forEach(([apiUrl, apiMethods]) => {
      const [, apiControllerName] = apiUrl.split('/');
      if (!_.has(appControllers, apiControllerName)) {
        throw new ICalAppError(`App ${version} does not contain "${apiControllerName}" controller for url "${apiUrl}"`);
      }
      const appActions = appControllers[apiControllerName];

      Object.entries(apiMethods).forEach(([apiMethod, params]) => {
        const methodParams = {
          security: openapi.security,
          method: apiMethod.toUpperCase(),
          url: `${config.API_PREFIX}${version}${apiUrl}`,
          ...params,
        };
        const { security, method, url } = methodParams;

        if (!_.has(methodActionMap, method)) {
          throw new ICalAppError(`App ${version} does not contain action matches for HTTP method "${method}"`);
        }
        const methodAction = methodActionMap[method];

        if (!_.has(appActions, methodAction)) {
          throw new ICalAppError(`App ${version} does not contain action "${methodAction}" for method "${method}" on url "${url}"`);
        }
        const action = appActions[methodAction];

        const route = {
          method,
          url,
          preHandler(req, res, done) {
            if (security.length === 0) {
              done();
              return;
            }

            const requiredRoles = security.flatMap((currentSecurity) => Object.values(currentSecurity).flat());
            const authHandlers = [this.jwtAuth];
            if (requiredRoles.length > 0) {
              req.requiredRoles = requiredRoles;
              authHandlers.push(this.rolesAuth);
            }

            this.auth(authHandlers, { relation: 'and' })(req, res, done);
          },
          handler(req, res) {
            const { body: data, user } = req;
            const app = {
              services: this.services,
              db: this.db,
              timezones: this.timezones,
              config: this.config,
            };

            return new Promise((resolve) => {
              resolve(action({ data, user, app }));
            }).then((result) => res.code(200).send(result));
          },
        };

        server.route(route);
      });
    }));
};

const setAuth = (config, server) => {
  server.decorateRequest('user', null);
  server.decorateRequest('requiredRoles', null);

  server.decorate('jwtAuth', (req, res, done) => {
    const token = req.headers.authorization.replace(/bearer\s*/i, '');
    server.services.jwt.verify(token)
      .then((user) => {
        req.user = user;
        done();
      })
      .catch((err) => {
        console.error(err);
        done(new AuthError(`Access denied for user with role "${req.user}"`, req.query));
      });
  });
  server.decorate('rolesAuth', (req, res, done) => {
    if (req.user === null) {
      done(new AuthError('User unauthorized'));
    }
    if (!_.has(req.user, 'viewerGroupRole')) {
      done(new AuthError('User is not group member'));
    }
    const isPermittedRole = req.requiredRoles.some((role) => `vk:${req.user.viewerGroupRole}` === role);
    if (!isPermittedRole) {
      done(new AuthError(`Access denied for user with role "${req.user.viewerGroupRole}"`));
    }
    done();
  });
};

const setServices = (config, server, reporter) => {
  const services = {
    vk: new VKService(config),
    ical: new ICALService(config),
    jwt: jwtService(config),
    reporter,
  };

  console.log(JSON.stringify({
    vk_access_token_settings: '',
    vk_app_id: '7966403',
    vk_are_notifications_enabled: '0',
    vk_group_id: '101295953',
    vk_is_app_user: '1',
    vk_is_favorite: '0',
    vk_language: 'ru',
    vk_platform: 'desktop_web',
    vk_ref: 'other',
    vk_ts: '1000000000',
    vk_user_id: '0',
    vk_viewer_group_role: 'admin',
    sign: 'B_07QeUbmuPRzrJnF5_sEh_6O-x6M5NYmR471Ztpv4E',
  }));

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

      const params = _.isEmpty(error.params) ? '' : `params: ${JSON.stringify(error.params, null, 2)}`;
      const message = [error.message, params].filter((x) => x).join('\n');
      return res.code(error.statusCode).send({
        code: error.code,
        message,
      });
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
  await setRoutes(config, server);
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
