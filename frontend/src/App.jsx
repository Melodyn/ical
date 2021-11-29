import 'core-js';
import 'regenerator-runtime';
import React, {
  useState,
  useEffect,
} from 'react';
// third
import {
  usePlatform,
  AdaptivityProvider,
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  PanelHeader,
} from '@vkontakte/vkui';
import Rollbar from 'rollbar';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import { RouterContext } from '@happysanta/router';
import i18next from 'i18next';
import eruda from 'eruda';
import pino from 'pino';
import upperFirst from 'lodash/upperFirst.js';
// modules
import resources from '../resources';
import { router } from '../libs/router.js';
import LoadingView from './components/LoadingView.jsx';
import Main from './components/Main.jsx';

let systemThemeWasChecked = false;

const App = ({ config, bridge }) => {
  const logger = pino({
    enabled: !config.IS_TEST_ENV,
    level: config.LOG_LEVEL,
  });

  const userConfig = {
    lng: localStorage.getItem('config.lng') || '',
    theme: localStorage.getItem('config.theme') || '',
    systemThemeWasChecked: localStorage.getItem('config.systemThemeWasChecked') === 'true',
  };
  if (!systemThemeWasChecked) {
    systemThemeWasChecked = userConfig.systemThemeWasChecked;
  }
  logger.debug('userConfig', userConfig);

  const defaultLng = 'en';
  const whiteListOfLng = Object.keys(resources);
  const vkLng = userConfig.lng || config.VK_PARAMS.language || defaultLng;
  const appLng = whiteListOfLng.includes(vkLng) ? vkLng : defaultLng;

  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(appLng);

  const defaultTheme = 'light';
  const [theme, changeTheme] = useState(userConfig.theme || defaultTheme);
  localStorage.setItem('config.theme', theme);
  const changeScheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('config.theme', newTheme);
    changeTheme(newTheme);
  };
  const schemeMap = {
    light: 'bright_light',
    dark: 'space_gray',
  };
  const scheme = schemeMap[theme];
  const defaultScheme = schemeMap.dark; // пока приложение грузится, чтобы не светилось в темноте

  const rollbarConfig = {
    accessToken: config.ROLLBAR_TOKEN,
    environment: `${config.NODE_ENV}-front`,
    enabled: config.IS_PROD_ENV || config.IS_DEV_ENV,
  };
  const rollbar = new Rollbar(rollbarConfig);

  bridge.subscribe((event) => {
    if (!event.detail) return;
    const { type, data } = event.detail;
    switch (type) {
      case 'VKWebAppUpdateConfig': {
        if (!userConfig.systemThemeWasChecked) {
        // if (!systemThemeWasChecked) {
          rollbar.debug(`VKWebAppUpdateConfig ${JSON.stringify(userConfig)}`);
          const systemTheme = data.appearance || defaultTheme;
          localStorage.setItem('config.theme', systemTheme);
          localStorage.setItem('config.systemThemeWasChecked', 'true');
          changeTheme(systemTheme);
        }
        break;
      }
      default:
        break;
    }
  });

  const queryPlatform = config.VK_PARAMS.platform || '';
  const isMobile = queryPlatform.includes('mobile');
  if (config.IS_PROD_ENV && isMobile) {
    eruda.init({
      defaults: {
        displaySize: 40,
        theme: upperFirst(theme),
      },
    });
  }

  useEffect(async () => {
    if (i18n === null) {
      const i18nInstance = i18next.createInstance();
      i18nInstance.on('languageChanged', (newLng) => {
        localStorage.setItem('config.lng', newLng);
        setLng(newLng);
      });
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
    logger.debug('params', {
      lng,
      theme,
      vkLng,
      isMobile,
      query: config.VK_PARAMS,
    });
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
            scheme={appIsLoaded ? scheme : defaultScheme}
            config={config}
            logger={logger}
            platform={usePlatform()}
            changeScheme={changeScheme}
          >
            <AdaptivityProvider>
              <AppRoot>
                <SplitLayout header={<PanelHeader separator={false} />}>
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
