import 'core-js';
import 'regenerator-runtime';
import React, {
  useState,
  useEffect,
} from 'react';
// third
import {
  AdaptivityProvider,
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
} from '@vkontakte/vkui';
import Rollbar from 'rollbar';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import { RouterContext } from '@happysanta/router';
import i18next from 'i18next';
import eruda from 'eruda';
import pino from 'pino';
// modules
import resources from '../resources';
import { router } from './router.js';
import LoadingView from './components/LoadingView.jsx';
import Main from './Main.jsx';

const App = ({ config, bridge }) => {
  const defaultLng = 'en';
  const whiteListOfLng = Object.keys(resources);
  const vkLng = config.VK_PARAMS.language || defaultLng;
  const appLng = whiteListOfLng.includes(vkLng) ? vkLng : defaultLng;

  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(appLng);

  const logger = pino({
    enabled: !config.IS_TEST_ENV,
    level: config.LOG_LEVEL,
  });

  const defaultTheme = 'light';
  const [theme, changeTheme] = useState(defaultTheme);
  const changeScheme = () => changeTheme(theme === 'light' ? 'dark' : 'light');
  const scheme = {
    light: 'bright_light',
    dark: 'space_gray',
  }[theme];
  bridge.subscribe((event) => {
    if (!event.detail) return;

    const { type, data } = event.detail;
    if (type && data) logger.info('bridge event', { type, data });

    switch (type) {
      case 'VKWebAppUpdateConfig': {
        changeTheme(data.appearance || defaultTheme);
        break;
      }
      case 'VKWebAppCreateHashResult': {
        logger.info('Check string (ts request_id hash): ', `${data.hash} ${data.ts} ${data.request_id}`);
        break;
      }
      default:
        break;
    }
  });

  const rollbarConfig = {
    accessToken: config.ROLLBAR_TOKEN,
    environment: `${config.NODE_ENV}-front`,
    enabled: config.IS_PROD_ENV || config.IS_DEV_ENV,
  };
  const rollbar = new Rollbar(rollbarConfig);

  if (config.IS_PROD_ENV) {
    eruda.init();
  }

  useEffect(async () => {
    if (i18n === null) {
      const i18nInstance = i18next.createInstance();
      i18nInstance.on('languageChanged', (newLng) => setLng(newLng));
      await i18nInstance
        .init({
          lng,
          resources,
          fallbackLng: defaultLng,
          debug: config.IS_DEV_ENV,
        })
        .then(() => setTranslation(i18nInstance));

      setAppIsLoaded(true);
    }
  });

  if (!appIsLoaded) {
    logger.debug('config', config, { lng, theme, vkLng });
    bridge.send('VKWebAppCreateHash', { request_id: JSON.stringify({ user_id: 1, data: 'Hello World' }) });
  }

  const ViewComponent = () => (appIsLoaded
    ? (<Main />)
    : (<LoadingView userLng={i18n ? i18n.language : appLng} />));

  return (
    <RollbarProvider instance={rollbar} config={rollbarConfig}>
      <ErrorBoundary>
        <RouterContext.Provider value={router}>
          <ConfigProvider
            isWebView
            i18n={i18n}
            bridge={bridge}
            scheme={scheme}
            config={config}
            logger={logger}
            changeScheme={changeScheme}
          >
            <AdaptivityProvider>
              <AppRoot>
                <SplitLayout>
                  <SplitCol>
                    <ViewComponent />
                  </SplitCol>
                </SplitLayout>
              </AppRoot>
            </AdaptivityProvider>
          </ConfigProvider>
        </RouterContext.Provider>
      </ErrorBoundary>
    </RollbarProvider>
  );
};

export default App;
