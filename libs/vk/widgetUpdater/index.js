import axios from 'axios';
import FormData from 'form-data';
import configValidator from '../../../utils/configValidator.cjs';
import errors from '../../../utils/errors.cjs';

const { ICalAppError } = errors;

const { envsMap } = configValidator;

const prodService = (apiURL) => ({ params }) => {
  const body = new FormData();
  Object.entries(params).forEach(([key, value]) => body.append(key, value));

  return axios({
    method: 'POST',
    url: apiURL,
    data: body,
    headers: body.getHeaders(),
  })
    .then(({ data }) => data)
    .then((data) => {
      if (!data.error) return data;

      throw new ICalAppError(JSON.stringify(data.error));
    });
};

const testService = async ({ widget }) => widget;

export default (env, apiURL) => {
  switch (env) {
    case envsMap.prod:
    case envsMap.stage:
      return prodService(apiURL);
    default:
      return testService;
  }
};
