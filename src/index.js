import './index.css';
import vkBridge from '@vkontakte/vk-bridge';

const bridge = vkBridge.default;

const stringify = (content) => {
  try {
    return JSON.stringify(content, null, 2);
  } catch (e) {
    return content.toString();
  }
}

const createLogger = () => {
  const logger = document.createElement('div');
  logger.setAttribute('id', 'logger');
  document.body.append(logger);

  return {
    log: (data) => {
      const hr = document.createElement('hr');
      const textNode = stringify(data);
      logger.prepend(hr);
      logger.prepend(textNode);
    }
  }
};

const init = () => {
  console.log({ gon });
  const logger = gon.user.isAppAdmin
    ? createLogger()
    : { log: () => {} };

  bridge.send('VKWebAppInit');
  bridge.subscribe(({ detail: { type = null, data = null }} = { detail: {} }) => {
    logger.log({ type, data })
  });

  if (gon.user.isAppAdmin) {
    console.log('send', 'VKWebAppGetCommunityToken');
    bridge
      .send('VKWebAppGetCommunityToken', {
        app_id: gon.user.appId,
        group_id: gon.user.groupId,
        scope: 'app_widget',
      })
      .then(logger.log)
      .catch(logger.log);
    console.log('sended', 'VKWebAppGetCommunityToken');
  }
};

document.addEventListener('DOMContentLoaded', init);
