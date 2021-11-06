import React from 'react';
import { ConfigProviderContext } from '@vkontakte/vkui';

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
