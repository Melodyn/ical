import React from 'react';
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
import { router } from './router.js';
import Main from './Main.jsx';

const App = () => {
  const platform = usePlatform();
  const appearance = useAppearance();
  const [theme, changeTheme] = React.useState(appearance || 'light');
  const changeScheme = () => changeTheme(theme === 'light' ? 'dark' : 'light');
  const scheme = {
    light: 'bright_light',
    dark: 'space_gray',
  }[theme];
  console.log({ appearance, theme, scheme });

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
                <Main />
              </SplitCol>
            </SplitLayout>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    </RouterContext.Provider>
  );
};

export default App;
