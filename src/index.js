import './index.css';
import vkBridgeDev from '@vkontakte/vk-bridge-mock';
import vkBridgeProd from '@vkontakte/vk-bridge';

const bridgeProd = vkBridgeProd.default;
const bridgeDev = vkBridgeDev.default;

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
    },
  };
};

const setApp = (bridge, logger) => {
  const requestSetup = () => bridge
    .send('VKWebAppAddToCommunity')
    .then((result) => {
      logger.log({ source: 'VKWebAppAddToCommunity', result });
      return result.group_id;
    })
    .catch((err) => {
      logger.log({ source: 'VKWebAppAddToCommunity', err });
      return null;
    });

  const setAppButton = document.querySelector('#setApp');
  const openAppButton = document.querySelector('#openClub');

  setAppButton.addEventListener('click', async () => {
    const clubId = await requestSetup();

    if (clubId) {
      const currentHref = openAppButton.getAttribute('href');
      openAppButton.setAttribute('href', `${currentHref}_-${clubId}`);

      const currentVisibleBlock = document.querySelector('.d-block');
      const currentInvisibleBlock = document.querySelector('.d-none');

      currentVisibleBlock.classList.remove('d-block');
      currentVisibleBlock.classList.add('d-none');
      currentInvisibleBlock.classList.remove('d-none');
      currentInvisibleBlock.classList.add('d-block');
    }
  });
};

const setToken = (bridge, logger) => {
  if (!gon.user.isAdmin) return;

  const requestWidgetToken = () => {
    if (gon.app.isProd) {
      alert('Ok');
      return null;
    }

    return bridge
      .send('VKWebAppGetCommunityToken', {
        app_id: gon.user.appId,
        group_id: gon.user.groupId,
        scope: 'app_widget',
      })
      .then(({ access_token }) => {
        logger.log({ source: 'VKWebAppGetCommunityToken', access_token });
        return access_token;
      })
      .catch((err) => {
        logger.log({ source: 'VKWebAppGetCommunityToken', err });
        return null;
      });
  };

  const { adminForm } = document.forms;
  const widgetTokenField = adminForm.elements.widgetToken;

  const setWidgetButton = document.querySelector('#setWidget');

  setWidgetButton.addEventListener('click', async () => {
    const token = await requestWidgetToken();
    if (token) {
      widgetTokenField.setAttribute('value', token);
      // adminForm.requestSubmit();
    }
  });
};

const handlerByPages = {
  main: [setApp],
  calendar: [setToken],
};

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const init = (bridge) => {
  const logger = gon.user.isAppAdmin
    ? createLogger()
    : { log: () => {} };

  bridge.send('VKWebAppInit');
  bridge.subscribe(({ detail: { type = null, data = null } } = { detail: {} }) => {
    logger.log({ source: 'subscribe', type, data });
  });

  const currentPage = gon.app.page;
  if (!has(handlerByPages, currentPage)) return;

  const pageHandlers = handlerByPages[currentPage];
  pageHandlers.forEach((handler) => handler(bridge, logger));
};

document.addEventListener('DOMContentLoaded', () => {
  const bridge = gon.app.isProd ? bridgeProd : bridgeDev;
  init(bridge);
});
