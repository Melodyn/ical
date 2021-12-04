const envsMap = {
  prod: 'production',
  stage: 'staging',
  dev: 'development',
  test: 'test',
  invalid: 'invalid',
};

const getRollbarTokenByEnv = (env) => {
  switch (env) {
    case envsMap.prod:
    case envsMap.stage:
      return '3fc738e63c1e4cd19b5b2584d06e2391';
    default:
      return 'ROLLBAR_TOKEN';
  }
};

const getLogLevelByEnv = (env) => {
  switch (env) {
    case envsMap.dev:
      return 'debug';
    case envsMap.prod:
      return 'debug';
    default:
      return 'silent';
  }
};

export default (NODE_ENV, VK_PARAMS = {}) => ({
  NODE_ENV,
  IS_PROD_ENV: NODE_ENV === envsMap.prod,
  IS_DEV_ENV: NODE_ENV === envsMap.dev,
  IS_TEST_ENV: NODE_ENV === envsMap.test,
  ROLLBAR_TOKEN: getRollbarTokenByEnv(NODE_ENV),
  LOG_LEVEL: getLogLevelByEnv(NODE_ENV),
  VK_PARAMS,
});
