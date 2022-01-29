import worker from '../__mocks__/server.js';
import IcalApiService from '../libs/IcalApiService/IcalApiService.js';
import generateConfig from '../libs/generateConfig.js';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlblNldHRpbmdzIjoiIiwiYXBwSWQiOjc5NjY0MDMsImFyZU5vdGlmaWNhdGlvbnNFbmFibGVkIjowLCJncm91cElkIjoxMDEyOTU5NTMsImlzQXBwVXNlciI6MSwiaXNGYXZvcml0ZSI6MCwibGFuZ3VhZ2UiOiJydSIsInBsYXRmb3JtIjoiZGVza3RvcF93ZWIiLCJyZWYiOiJvdGhlciIsInRzIjoxMDAwMDAwMDAwLCJ1c2VySWQiOjAsInZpZXdlckdyb3VwUm9sZSI6ImFkbWluIiwic2lnbiI6IkJfMDdRZVVibXVQUnpySm5GNV9zRWhfNk8teDZNNU5ZbVI0NzFadHB2NEUiLCJpc0FkbWluIjp0cnVlLCJpc0FwcEFkbWluIjp0cnVlLCJpYXQiOjE2NDE3MjAxOTgsImV4cCI6MTY0MTgwNjU5OH0.UgLS6l2lOzLzboO7iVIdmryxruA2xC_AkgyfcNtVnV0';
const env = process.env.NODE_ENV || 'test';
const vkParams = {
  vk_language: 'en',
  vk_platform: 'desktop_web',
  vk_user_id: '1',
  sign: 'saf',
};
const config = generateConfig(env, vkParams);

const session = {};
const sessionStorage = {
  read: (id) => session[id],
  save: (id, ...params) => {
    session[id] = params;
  },
};

beforeAll(() => {
  worker.listen();
});
afterAll(() => {
  worker.close();
});

test('negative /auth', async () => {
  const { sign, ...other } = vkParams;
  const configWithoutSign = {
    ...config,
    VK_PARAMS: other,
  };
  const icalApi = new IcalApiService(configWithoutSign, sessionStorage);
  await expect(icalApi.auth()).rejects.toThrow();

  expect(session).not.toHaveProperty(vkParams.sign);
  const error = await icalApi.auth().catch((err) => err);
  expect(error).toEqual(expect.objectContaining({
    message: expect.any(String),
    name: expect.any(String),
    params: expect.any(Object),
  }));
});

test('positive /auth', async () => {
  const icalApi = new IcalApiService(config, sessionStorage);
  await expect(icalApi.auth()).resolves.not.toThrow();

  expect(session).toHaveProperty(vkParams.sign);
  const [sessionToken, sessionObject] = session[vkParams.sign];
  expect(sessionToken).toEqual(token);
  expect(sessionObject).toEqual(expect.objectContaining({
    sign: expect.any(String),
  }));
});
