const path = require('path');
const { envsMap, configValidator } = require('./utils/configValidator.cjs');

const configByEnv = {
  [envsMap.test]: (config) => ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    entities: [path.join(__dirname, 'entity', '*.cjs')],
    migrations: [path.join(__dirname, 'migration', '*.cjs')],
    synchronize: false,
    logging: ['query', 'error', 'migration'],
  }),
  [envsMap.dev]: (config) => ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    entities: [path.join(__dirname, 'entity', '*.cjs')],
    migrations: [path.join(__dirname, 'migration', '*.cjs')],
    synchronize: false,
    logging: ['query', 'error', 'migration'],
    cli: {
      migrationsDir: 'migration',
    },
  }),
  [envsMap.prod]: (config) => ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    entities: ['entity/*.cjs'],
    migrations: ['migration/*.cjs'],
    synchronize: false,
    logging: ['migration'],
  }),
  [envsMap.invalid]: (config) => ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    entities: [path.join(__dirname, 'entity', '*.cjs')],
    migrations: [path.join(__dirname, 'migration', '*.cjs')],
    synchronize: false,
    logging: false,
  }),
};

const appConfig = configValidator(process.env.NODE_ENV)
  .then((config) => configByEnv[process.env.NODE_ENV](config));

module.exports = appConfig;
