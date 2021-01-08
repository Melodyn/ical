import './index.css';
// import vkBridge from '@vkontakte/vk-bridge-mock';
import vkBridge from '@vkontakte/vk-bridge';

const bridge = vkBridge.default;

const stringify = (content) => {
  try {
    return JSON.stringify(content, null, 2);
  } catch (e) {
    return content.toString();
  }
};

const createLogger = () => {
  const logger = document.createElement('textarea');
  logger.setAttribute('id', 'logger');
  document.body.append(logger);

  return {
    log: (data) => {
      const textNode = stringify(data);
      logger.prepend('\n\n-----\n\n');
      logger.prepend(textNode);
    }
  };
};

const requestWidgetToken = (bridge, logger) => {
  const adminForm = document.forms.adminForm;
  const widgetTokenField = adminForm.elements.widgetToken;

  bridge
    .send('VKWebAppGetCommunityToken', {
      app_id: gon.user.appId,
      group_id: gon.user.groupId,
      scope: 'app_widget',
    })
    .then(({ access_token }) => {
      logger.log({ source: 'VKWebAppGetCommunityToken', access_token });

      alert('Ok');
      // widgetTokenField.value = access_token;
      //
      // return adminForm.requestSubmit();
    })
    .catch((err) => logger.log({ source: 'VKWebAppGetCommunityToken', err }));
};

const init = async () => {
  const logger = gon.user.isAppAdmin
    ? createLogger()
    : { log: () => {} };

  bridge.send('VKWebAppInit');

  if (!gon.user.isAdmin) return;

  const setWidgetButton = document.querySelector('#setWidget');
  if (setWidgetButton) {
    setWidgetButton.addEventListener('click', () => {
      requestWidgetToken(bridge, logger);
    });
  }
};

document.addEventListener('DOMContentLoaded', init);
