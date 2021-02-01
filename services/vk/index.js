import _ from 'lodash';
import prodService from './Prod/index.js';
import prodWidgetService from './Prod/widgetService.js';
import devWidgetService from './Dev/widgetService.js';
import widgets from './widgets.js';
import errors from '../../utils/errors.cjs';
import configValidator from '../../utils/configValidator.cjs';

const { envsMap } = configValidator;
const { ICalAppError } = errors;

const serviceFactory = (config, widgetConstructor, reporter) => {
  const period = { milliseconds: config.SYNC_ICAL_TIME };
  switch (config.NODE_ENV) {
    case envsMap.dev: {
      const devWidgService = devWidgetService(config);
      const prodWidgService = prodWidgetService(config, widgetConstructor);
      const widgetService = { ...prodWidgService, ...devWidgService };
      return prodService({ period, widgetService, reporter });
    }
    case envsMap.prod: {
      const widgetService = prodWidgetService(config, widgetConstructor);
      return prodService({ period, widgetService, reporter });
    }
    default: {
      const widgetService = prodWidgetService(config, widgetConstructor);
      return prodService({ period, widgetService, reporter });
    }
  }
};

export default (config, reporter) => {
  if (!_.has(widgets, config.VK_WIDGET_TYPE)) {
    throw new ICalAppError(`Unexpected widget type ${config.VK_WIDGET_TYPE}`);
  }
  const widgetConstructor = widgets[config.VK_WIDGET_TYPE];
  return serviceFactory(config, widgetConstructor, reporter);
};
