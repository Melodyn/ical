import React from 'react';
import { ConfigProviderContext } from '@vkontakte/vkui';

export const useScheme = () => {
  const { appearance, changeScheme } = React.useContext(ConfigProviderContext);
  return [appearance, changeScheme];
};

export const useConfig = () => {
  const { config } = React.useContext(ConfigProviderContext);
  return config;
};

export const useBridge = () => {
  const { bridge } = React.useContext(ConfigProviderContext);
  return bridge;
};

export const useLogger = () => {
  const { logger } = React.useContext(ConfigProviderContext);
  const setLogLevel = (newLevel) => {
    logger.level = newLevel;
  };
  return [logger, setLogLevel];
};

export const useTranslations = () => {
  const { i18n } = React.useContext(ConfigProviderContext);
  const t = i18n.t.bind(i18n);
  return [t, i18n];
};

export const useUser = () => {
  const { user } = React.useContext(ConfigProviderContext);
  return user;
};

export const useIcalApi = () => {
  const { icalApi } = React.useContext(ConfigProviderContext);
  return icalApi;
};
