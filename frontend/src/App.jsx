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
  const userLng = 'en'; // TODO: надо брать из параметров: https://vk.com/dev/vk_apps_docs3?f=6.%2B%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%2B%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA%D0%B0#:~:text=%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%BA%D0%B0%20%D1%83%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D0%B9%20%D1%80%D0%B0%D0%B7%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B0.-,vk_language,-string
  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(userLng);

  useEffect(async () => {
    if (i18n === null) {
      const i18nInstance = i18next.createInstance();
      i18nInstance.on('languageChanged', (newLng) => setLng(newLng));
      await i18nInstance
        .init({ lng, resources })
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
                    userLng={i18n ? i18n.language : userLng}
                  />
                </translationContext.Provider>
              </SplitCol>
            </SplitLayout>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    </RouterContext.Provider>
  );
};

export default App;
