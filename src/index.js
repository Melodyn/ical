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
    const hr = document.createElement('hr');
    logger.classList.add('h-100');
    logger.style = 'overflow-y: scroll;';
    document.body.prepend(logger);
    bridge.subscribe((e) => {
      const textNode = stringify(e);
      logger.prepend(hr);
      logger.prepend(textNode);
    });
  } else {
    // Subscribes to event, sended by client
    bridge.subscribe((e) => {
      console.log('subscribe', e);
    });
  }
};

document.addEventListener('DOMContentLoaded', init);
