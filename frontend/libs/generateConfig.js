const envsMap = {
  prod: 'production',
  stage: 'staging',
  dev: 'development',
  test: 'test',
  invalid: 'invalid',
};

const rollbarTokenByEnv = {
  [envsMap.prod]: '3fc738e63c1e4cd19b5b2584d06e2391',
  [envsMap.stage]: '3fc738e63c1e4cd19b5b2584d06e2391',
  [envsMap.dev]: 'ROLLBAR_TOKEN',
  [envsMap.test]: 'ROLLBAR_TOKEN',
  [envsMap.invalid]: 'ROLLBAR_TOKEN',
};

export default (NODE_ENV, VK_PARAMS = {}) => ({
  NODE_ENV,
  IS_PROD_ENV: NODE_ENV === envsMap.prod,
  IS_DEV_ENV: NODE_ENV === envsMap.dev,
  IS_TEST_ENV: NODE_ENV === envsMap.test,
  ROLLBAR_TOKEN: rollbarTokenByEnv[NODE_ENV],
  VK_PARAMS,
});
