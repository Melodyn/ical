// import yup from 'yup';
// import path from 'path';
// import _ from 'lodash';
// import dotenv from 'dotenv';
// import { ConfigValidationError } from './errors.js';
const yup = require('yup');
const path = require('path');
const _ = require('lodash');
const dotenv = require('dotenv');
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
