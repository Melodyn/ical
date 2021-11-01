import camelCase from 'lodash/camelCase.js';
import trimStart from 'lodash/trimStart.js';

const numberify = (value) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? value : parsed;
};
const appParamsParser = (url) => Object.fromEntries(
  Array.from(url.searchParams)
    .filter(([key]) => key.startsWith('vk_'))
    .map(([key, value]) => [trimStart(key, 'vk_'), numberify(value)])
    .map(([key, value]) => [camelCase(key), value]),
);

export default appParamsParser;
