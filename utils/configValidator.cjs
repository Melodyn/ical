const yup = require('yup');
const path = require('path');
const _ = require('lodash');
const dotenv = require('dotenv');
const ms = require('ms');
const tz = require('countries-and-timezones');
const { ConfigValidationError } = require('./errors.cjs');

const envsMap = {
  prod: 'production',
  stage: 'staging',
  dev: 'development',
  test: 'test',
  invalid: 'invalid',
};

const readFromFile = (configPath) => dotenv.config({ path: path.resolve(configPath) }).parsed;
const envConfigMap = {
  [envsMap.prod]: process.env,
  [envsMap.stage]: process.env,
  [envsMap.dev]: readFromFile('development.env'),
  [envsMap.test]: readFromFile('test.config'),
  [envsMap.invalid]: readFromFile('invalid.config'),
};

const checkEnv = (expected) => (current, schema) => schema.default(current === expected);

const configSchema = yup.object({
  NODE_ENV: yup.string().oneOf(_.values(envsMap)).required(),
  IS_TEST_ENV: yup.boolean().when('NODE_ENV', checkEnv(envsMap.test)),
  IS_DEV_ENV: yup.boolean().when('NODE_ENV', checkEnv(envsMap.dev)),
  IS_STAGE_ENV: yup.boolean().when('NODE_ENV', checkEnv(envsMap.stage)),
  IS_PROD_ENV: yup.boolean().when('NODE_ENV', checkEnv(envsMap.prod)),
  PORT: yup.number().required(),
  HOST: yup.string().required(),
  LOG_LEVEL: yup.string().required(),
  DB_TYPE: yup.string().required(),
  DB_HOST: yup.string().required(),
  DB_PORT: yup.number().required(),
  DB_USER: yup.string().required(),
  DB_PASS: yup.string().required(),
  DB_NAME: yup.string().required(),
  ROLLBAR_TOKEN: yup.string().required(),
  VK_APP_ID: yup.number().required(),
  VK_APP_ADMIN_ID: yup.number().required(),
  VK_PROTECTED_KEY: yup.string().required(),
  VK_SERVICES_KEY: yup.string().required(),
  VK_WIDGET_TYPE: yup.string().required(),
  VK_API_VERSION: yup.number().positive().required(),
  DEFAULT_TIMEZONE: yup.string().oneOf(Object.keys(tz.getAllTimezones())).required(),
  CRON_ICAL_TIME: yup.string().required(),
  SYNC_ICAL_TIME: yup.mixed().transform((value) => ms(value)),
}).required();

const configValidator = (envName) => {
  const envExists = _.has(envConfigMap, envName);
  if (!envExists) throw new Error(`Unexpected env "${envName}"`);
  const envConfig = envConfigMap[envName];

  return configSchema
    .validate(envConfig, { abortEarly: false })
    .catch((err) => {
      throw new ConfigValidationError(err);
    });
};

module.exports = { configValidator, envsMap };
