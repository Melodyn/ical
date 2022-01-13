import crypto from 'crypto';
import _ from 'lodash';

const removePrefix = (text, prefix = 'vk_') => text.split(prefix).filter((x) => x).join('');

const numberify = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const validationResult = ({ error = null, user = null, params = {} }) => ({
  isValid: (error === null),
  user,
  params,
  error,
});

export const buildSign = (query, secret) => {
  const vkQueryParams = Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key.startsWith('vk_'))
      .sort(),
  );

  return crypto
    .createHmac('sha256', secret)
    .update(new URLSearchParams(vkQueryParams).toString())
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');
};

export const createValidator = (secret, appAdminId) => (query = {}) => {
  const vkSign = query.sign;
  if (!vkSign) return validationResult({ error: 'Required parameter "sign" is missing', params: query });

  const queryParamsSign = buildSign(query, secret);
  if (vkSign !== queryParamsSign) return validationResult({ error: 'Incorrect sign', params: query });

  const userParams = Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key.startsWith('vk_'))
      .map(([key, value]) => [removePrefix(key), numberify(value)])
      .map(([key, value]) => [_.camelCase(key), value]),
  );

  const user = {
    ...userParams,
    sign: vkSign,
    platform: userParams.platform || '',
    isAdmin: (userParams.viewerGroupRole === 'admin'),
    isAppAdmin: (userParams.userId === appAdminId),
  };

  return validationResult({ user });
};
