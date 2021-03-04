import axios from 'axios';
import configValidator from '../../../utils/configValidator.cjs';
import errors from '../../../utils/errors.cjs';

const { ICalAppError } = errors;

const { envsMap } = configValidator;

const prodService = (apiURL) => ({ params }) => axios
  .get(apiURL, { params })
  .then(({ data }) => data)
  .then((data) => {
    if (!data.error) return data;

    throw new ICalAppError(JSON.stringify(data.error));
  });

const devService = ({ widget }) => Promise.resolve(widget).then((res) => {
  console.log('widgetUpdater', JSON.stringify(res));
  return res;
});

const testService = ({ widget }) => Promise.resolve(widget);

export default (env, apiURL) => {
  switch (env) {
    case envsMap.prod:
    case envsMap.stage:
      return prodService(apiURL);
    case envsMap.dev:
      return devService;
    default:
      return testService;
  }
};
