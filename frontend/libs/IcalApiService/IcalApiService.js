import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep.js';
import IcalApiError from './IcalApiError';

const parseToken = (token) => {
  const [, encodedPayload] = token.split('.');
  // Black magic from https://developer.mozilla.org/ru/docs/Glossary/Base64#solution_1_%E2%80%93_escaping_the_string_before_encoding_it
  const decodedPayload = decodeURIComponent(atob(encodedPayload)
    .split('')
    .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
    .join(''));
  return JSON.parse(decodedPayload);
};

// TODO: Если сохранять токен в локалсторож, то он должен меняться, если изменился sign, иначе пока пользователь аутентифицирован, изменения query string не будут учитываться.
class IcalApiService {
  constructor(config) {
    this.rawToken = '';
    this.parsedToken = {};
    this.icalUser = {};
    this.vkUser = config.VK_PARAMS;
    this.api = axios.create({
      baseURL: config.ICAL_API_BASEURL,
    });
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => Promise.reject(IcalApiError.isApiError(error)
        ? new IcalApiError(error)
        : IcalApiError({
          message: error.message,
          name: `api.${error.response.status}`,
          params: this.vkUser,
        })),
    );
  }

  async auth() {
    const secondsNow = (Date.now() / 1000);
    const { exp = secondsNow } = this.parsedToken;
    const tokenIsExpired = (exp <= secondsNow);
    const tokenIsEmpty = (this.rawToken === '');
    if (tokenIsEmpty || tokenIsExpired) {
      // TODO: this.vkUser не подходит, т.к. там преобразовываются ключи и пропадает sign.
      await this.api.post('/auth', this.vkUser)
        .then((rawToken) => {
          try {
            const token = rawToken.toString();
            this.parsedToken = parseToken(token);
            this.rawToken = token;
            this.api.defaults.headers.common.Authorization = token;
          } catch (err) {
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

  getUser() {
    return cloneDeep(this.icalUser);
  }

  getCalendar() {
    return this.auth().then(() => this.api.get('/calendar'));
  }

  setCalendar(data) {
    return this.auth().then(() => this.api.post('/calendar', data));
  }
}

export default IcalApiService;
