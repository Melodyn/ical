import React from 'react';
import {
  AdaptivityProvider,
  ConfigProvider,
  AppRoot,
  SplitLayout,
  SplitCol,
} from '@vkontakte/vkui';
import Main from './Main.jsx';

const App = () => (
  <ConfigProvider>
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
);

export default App;
