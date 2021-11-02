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
  usePlatform,
} from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import Rollbar from 'rollbar';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import { RouterContext } from '@happysanta/router';
import i18next from 'i18next';
import eruda from 'eruda';
// modules
import { resources, translationContext } from '../resources';
import { router } from './router.js';
import Main from './Main.jsx';

const App = ({ config }) => {
  const whiteListOfLng = Object.keys(resources);
  const defaultLng = 'en';
  const vkLng = config.VK_PARAMS.language || defaultLng;
  const appLng = whiteListOfLng.includes(vkLng) ? vkLng : defaultLng;

  const platform = usePlatform();
  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(appLng);

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

    switch (type) {
      case 'VKWebAppUpdateConfig': {
        changeTheme(data.appearance || defaultTheme);
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
    console.log('config', config);
    console.log('hooks', {
      platform, theme, scheme, changeScheme,
    });
  }

  return (
    <RollbarProvider instance={rollbar} config={rollbarConfig}>
      <ErrorBoundary>
        <RouterContext.Provider value={router}>
          <ConfigProvider
            isWebView
          >
            <AdaptivityProvider>
              <AppRoot>
                <SplitLayout>
                  <SplitCol>
                    <translationContext.Provider value={i18n}>
                      <Main
                        appIsLoaded={appIsLoaded}
                        userLng={i18n ? i18n.language : appLng}
                      />
                    </translationContext.Provider>
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
