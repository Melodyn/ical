import vkBridge from '@vkontakte/vk-bridge';

const bridge = vkBridge.default;

const init = () => {
  // Sends event to client
  bridge.send('VKWebAppInit');

  // Subscribes to event, sended by client
  bridge.subscribe(() => {});
};

document.addEventListener('DOMContentLoaded', init);
