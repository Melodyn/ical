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
import { RouterContext } from '@happysanta/router';
import i18next from 'i18next';
import { resources, translationContext } from './resources';
import { router } from './router.js';
import Main from './Main.jsx';

const App = () => {
  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState('en');

  useEffect(() => {
    if (i18n === null) {
      const i18nInstance = i18next.createInstance();
      i18nInstance.on('languageChanged', (newLng) => setLng(newLng));
      i18nInstance
        .init({
          lng,
          debug: true,
          resources,
        })
        .then(() => {
          setTranslation(i18nInstance);
          setAppIsLoaded(true);
        });
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
  console.log({
    lng,
    appearance,
    theme,
    scheme,
  });

  return (
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
                {appIsLoaded
                && (
                <translationContext.Provider value={i18n}>
                  <Main />
                </translationContext.Provider>
                )}
              </SplitCol>
            </SplitLayout>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    </RouterContext.Provider>
  );
};

export default App;
