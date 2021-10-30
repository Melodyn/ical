import camelCase from 'lodash/camelCase.js';

const removePrefix = (text, prefix = 'vk_') => text.split(prefix).filter((x) => x).join('');
const numberify = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
};
const appParamsParser = (url) => Object.fromEntries(
  Array.from(url.searchParams)
    .filter(([key]) => key.startsWith('vk_'))
    .map(([key, value]) => [removePrefix(key), numberify(value)])
    .map(([key, value]) => [camelCase(key), value]),
);

export default appParamsParser;
