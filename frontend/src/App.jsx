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

const ViewComponent = ({ appIsLoaded, appLng }) => (appIsLoaded
  ? (<Main />)
  : (<LoadingView userLng={appLng} />));

const App = ({ config, bridge }) => {
  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const [loggerWasInit, setLoggerWasInit] = useState(false);
  const [rollbarWasInit, setRollbarWasInit] = useState(false);
  const [i18nWasInit, setI18nWasInit] = useState(false);
  const [erudaWasInit, setErudaWasInit] = useState(false);
  const [bridgeWasSubscribed, setBridgeWasSubscribed] = useState(false);

  const [logger, setLogger] = useState(null);
  if (logger === null) {
    const log = pino({
      enabled: !config.IS_TEST_ENV,
      level: config.LOG_LEVEL,
    });
    setLogger(log);
    setLoggerWasInit(true);
  }

  const getUserConfig = () => ({
    lng: localStorage.getItem('ical.config.lng') || '',
    theme: localStorage.getItem('ical.config.theme') || '',
    systemThemeWasChecked: localStorage.getItem('ical.config.systemThemeWasChecked') === 'true',
  });
  const userConfig = getUserConfig();

  const defaultLng = 'en';
  const whiteListOfLng = Object.keys(resources);
  const vkLng = userConfig.lng || config.VK_PARAMS.language || defaultLng;
  const appLng = whiteListOfLng.includes(vkLng) ? vkLng : defaultLng;

  const [rollbar, setRollbar] = useState(null);
  const [i18n, setTranslation] = useState(null);
  const [lng, setLng] = useState(appLng);
  localStorage.setItem('ical.config.lng', lng);

  useEffect(async () => {
    if (i18n === null) {
      const i18nInstance = i18next.createInstance();
      i18nInstance.on('languageChanged', (newLng) => {
        localStorage.setItem('ical.config.lng', newLng);
        setLng(newLng);
      });
      await i18nInstance
        .init({
          lng,
          resources,
          fallbackLng: defaultLng,
          debug: config.IS_DEV_ENV,
        });
      setTranslation(i18nInstance);
      setI18nWasInit(true);
    }
  }, []);

  const rollbarConfig = {
    accessToken: config.ROLLBAR_TOKEN,
    environment: `${config.NODE_ENV}-front`,
    enabled: config.IS_PROD_ENV || config.IS_DEV_ENV,
  };
  if (rollbar === null) {
    setRollbar(new Rollbar(rollbarConfig));
    setRollbarWasInit(true);
  }

  const defaultTheme = 'light';
  const [theme, changeTheme] = useState(userConfig.theme || defaultTheme);
  localStorage.setItem('ical.config.theme', theme);
  const changeScheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ical.config.theme', newTheme);
    changeTheme(newTheme);
  };
  const schemeMap = {
    light: 'bright_light',
    dark: 'space_gray',
  };
  const scheme = schemeMap[theme];
  const defaultScheme = schemeMap.dark; // пока приложение грузится, что��ы не светилось в темноте

  if (!bridgeWasSubscribed) {
    bridge.subscribe((event) => {
      if (!event.detail) return;
      const { type, data } = event.detail;
      switch (type) {
        case 'VKWebAppUpdateConfig': {
          if (!getUserConfig().systemThemeWasChecked) {
            const systemTheme = data.appearance || defaultTheme;
            localStorage.setItem('ical.config.theme', systemTheme);
            localStorage.setItem('ical.config.systemThemeWasChecked', 'true');
            changeTheme(systemTheme);
          }
          break;
        }
        default:
          break;
      }
    });
    setBridgeWasSubscribed(true);
  }

  const queryPlatform = config.VK_PARAMS.platform || '';
  const isMobile = queryPlatform.includes('mobile');
  const isErudaEnv = config.IS_PROD_ENV && isMobile;
  if (isErudaEnv && !erudaWasInit) {
    eruda.init({
      defaults: {
        displaySize: 40,
        theme: upperFirst(theme),
      },
    });
    const snippets = eruda.get('snippets');
    const erudaConsole = eruda.get('console');
    const log = (...msgs) => {
      erudaConsole.log(...msgs);
      logger.debug(...msgs);
    };
    snippets.add(
      'Get config',
      // eslint-disable-next-line no-undef
      () => log('config', getConfig()),
      'Show ical config object',
    );
    setErudaWasInit(true);
  }

  const allServicesWasInit = loggerWasInit && rollbarWasInit
    && i18nWasInit && bridgeWasSubscribed
    && (erudaWasInit || !isErudaEnv);
  if (allServicesWasInit && !appIsLoaded) {
    setAppIsLoaded(true);
  }

  if (appIsLoaded) {
    logger.debug('loading process', 'App loaded');
    logger.debug('params', {
      lng,
      theme,
      vkLng,
      isMobile,
      query: config.VK_PARAMS,
    });
  }
  if (loggerWasInit && !appIsLoaded) {
    logger.debug('loading process', {
      allServicesWasInit,
      loggerWasInit,
      rollbarWasInit,
      i18nWasInit,
      bridgeWasSubscribed,
      erudaWasInit,
      isErudaEnv,
    });
  }

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
                    <ViewComponent
                      appIsLoaded={appIsLoaded}
                      appLng={i18nWasInit ? i18n.language : appLng}
                    />
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
