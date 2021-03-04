import axios from 'axios';
import configValidator from '../../../utils/configValidator.cjs';

const { envsMap } = configValidator;

const prodService = (apiURL) => ({ params }) => axios.get(apiURL, { params });
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
