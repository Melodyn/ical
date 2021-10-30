import 'core-js';
import 'regenerator-runtime';
import React, {
  useState,
  useEffect,
} from 'react';
import {
  AdaptivityProvider,
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
  usePlatform,
  useAppearance,
} from '@vkontakte/vkui';
import Rollbar from 'rollbar';
import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';

import { RouterContext } from '@happysanta/router';
import i18next from 'i18next';
import eruda from 'eruda';

import { resources, translationContext } from '../resources';
import { router } from './router.js';
import Main from './Main.jsx';

const App = ({ config }) => {
  const whiteListOfLng = Object.keys(resources);
  const defaultLng = 'en';
  const vkLng = config.VK_PARAMS.language || defaultLng;
  const appLng = whiteListOfLng.includes(vkLng) ? vkLng : defaultLng;

  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(appLng);

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
      console.log(config);
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

  const platform = usePlatform();
  const appearance = useAppearance();
  const [theme, changeTheme] = useState(appearance || 'light');
  const changeScheme = () => changeTheme(theme === 'light' ? 'dark' : 'light');
  const scheme = {
    light: 'bright_light',
    dark: 'space_gray',
  }[theme];

  return (
    <RollbarProvider instance={rollbar} config={rollbarConfig}>
      <ErrorBoundary>
        <RouterContext.Provider value={router}>
          <ConfigProvider
            isWebView
            platform={platform}
            scheme={scheme}
            changeScheme={changeScheme}
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
