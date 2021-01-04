import './index.css';
import vkBridge from '@vkontakte/vk-bridge';

const bridge = vkBridge.default;

const stringify = (content) => {
  try {
    return JSON.stringify(content)
  } catch (e) {
    return content.toString();
  }
}

const init = () => {
  // Sends event to client
  bridge.send('VKWebAppInit');

  if (window.location.href.includes('35931944')) {
    const logger = document.createElement('div');
    logger.id = 'logger';
    document.body.append(logger);
    bridge.subscribe(({ detail: { type = null, data = null }} = { detail: {} }) => {
      const hr = document.createElement('hr');
      const textNode = stringify({ type, data });
      logger.prepend(hr);
      logger.prepend(textNode);
    });
  } else {
    // Subscribes to event, sended by client
    bridge.subscribe(() => {});
  }
};

document.addEventListener('DOMContentLoaded', init);
