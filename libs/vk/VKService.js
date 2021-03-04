import { createValidator } from './common/userValidator.js';
import widgetConstructor from './common/widgetConstructor.js';
import widgetUpdater from './widgetUpdater/index.js';

export default class VKService {
  constructor(params) {
    this.userValidator = createValidator(params.VK_PROTECTED_KEY, params.VK_APP_ADMIN_ID);
    this.widgetConstructor = widgetConstructor(params.VK_API_VERSION, params.VK_APP_ID);
    this.widgetUpdater = widgetUpdater(params.NODE_ENV);
    this.apiURL = params.VK_API_URL;
  }

  validateUser(queryParams) {
    return this.userValidator(queryParams);
  }

  createWidget(widgetToken, calendar = null) {
    return this.widgetConstructor(widgetToken, calendar);
  }

  updateWidget({ params, widget }) {
    return this.widgetUpdater({ apiURL: this.apiURL, params, widget });
  }
}
