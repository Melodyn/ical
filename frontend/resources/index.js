import React, { useContext } from 'react';
import en from './en.js';
import ru from './ru.js';

export const resources = { en, ru };
export const translationContext = React.createContext({});
export const useTranslations = () => {
  const i18n = useContext(translationContext);
  const t = i18n.t.bind(i18n);

  return [t, i18n];
};
