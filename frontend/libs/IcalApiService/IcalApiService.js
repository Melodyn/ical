import axios from 'axios';
import camelCase from 'lodash/camelCase.js';
import trimStart from 'lodash/trimStart.js';
import IcalApiError from './IcalApiError.js';

const numberify = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
};
const paramsToUser = (vkParams) => Object.fromEntries(
  Object.entries(vkParams)
    .filter(([key]) => key.startsWith('vk_'))
    .map(([key, value]) => [trimStart(key, 'vk_'), numberify(value)])
    .map(([key, value]) => [camelCase(key), value]),
);
const parseToken = (token) => {
  const [, encodedPayload] = token.split('.');
  // Black magic from https://developer.mozilla.org/ru/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
  const decodedPayload = decodeURIComponent(atob(encodedPayload)
    .split('')
    .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
    .join(''));
  return JSON.parse(decodedPayload);
};

class IcalApiService {
  constructor(config, sessionStorage) {
    this.sessionStorage = sessionStorage;
    this.vkUser = config.VK_PARAMS;
    this.sessionId = config.VK_PARAMS.sign
      || (Math.floor(Date.now() / 1000000) * 1000000).toString();

    this.rawToken = this.sessionStorage.read(this.sessionId);
    this.icalUser = this.rawToken ? parseToken(this.rawToken) : paramsToUser(config.VK_PARAMS);
    this.sessionStorage.save(this.sessionId, this.rawToken, this.icalUser);

    this.api = axios.create({
      baseURL: config.ICAL_API_BASEURL,
    });
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => Promise.reject(IcalApiError.isApiError(error.response.data)
        ? new IcalApiError(error.response.data)
        : IcalApiError({
          message: error.message,
          name: `api.${error.response.status}`,
          params: this.vkUser,
        })),
    );
  }

  async auth() {
    const secondsNow = (Date.now() / 1000);
    const { exp = secondsNow } = this.icalUser;
    const tokenIsExpired = (exp <= secondsNow);
    const tokenIsEmpty = (this.rawToken === '');
    if (tokenIsEmpty || tokenIsExpired) {
      await this.api.post('/auth', this.vkUser)
        .then(({ token: rawToken }) => {
          try {
            const token = rawToken.toString();
            this.icalUser = parseToken(token);
            this.rawToken = token;
            this.api.defaults.headers.common.Authorization = token;
            this.sessionStorage.save(this.sessionId, this.rawToken, this.icalUser);
          } catch (err) {
            console.log('err', err);
            throw new IcalApiError({
              message: err.message,
              name: 'auth.token.parsing',
              params: {
                ...this.vkUser,
                token: rawToken,
              },
            });
          }
        });
    }
  }

  getCalendar() {
    return this.auth().then(() => this.api.get('/calendar'));
  }

  setCalendar(data) {
    return this.auth().then(() => this.api.post('/calendar', data));
  }
}

export default IcalApiService;
