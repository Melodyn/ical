import React from 'react';
import {
  AdaptivityProvider,
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
} from '@vkontakte/vkui';
import { RouterContext } from '@happysanta/router';
import { router } from './router.js';
import Main from './Main.jsx';

const App = () => (
  <RouterContext.Provider value={router}>
    <ConfigProvider isWebView>
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

export default App;
