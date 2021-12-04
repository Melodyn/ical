import bridge from '@vkontakte/vk-bridge';

const proxyBridge = new Proxy({}, { get: () => () => {} });

const getVkBridge = ({ IS_PROD_ENV }) => (IS_PROD_ENV
  ? bridge.default
  : proxyBridge);

export default getVkBridge;
