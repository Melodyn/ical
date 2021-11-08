import React from 'react';
import {
  Group, Panel, PanelHeader, Header, View, Div,
  Button,
} from '@vkontakte/vkui';
import { useTranslations, useScheme } from '../../../hooks';

const SettingsView = (props) => {
  const [tr, i18n] = useTranslations();
  const t = (name, params) => tr(`page.settings.${name}`, params);
  const [scheme, changeScheme] = useScheme();
  const { id, activePanel, history } = props;
  const nextLng = i18n.language === 'ru' ? 'en' : 'ru';
  const nextScheme = scheme === 'light' ? 'dark' : 'light';
  const changeLanguage = () => i18n.changeLanguage(nextLng);

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader>{t('header')}</PanelHeader>
        <Group>
          <Div>
            <Header className="ps-0">{t('group.app.header')}</Header>
            <div className="d-flex justify-content-center align-items-start py-2">
              <p className="flex-grow-1">
                {t('group.app.changeScheme', {
                  scheme: nextScheme,
                })}
              </p>
              <Button className="ms-4" onClick={changeScheme}>
                {t('group.app.button.changeScheme')}
              </Button>
            </div>
            <div className="d-flex justify-content-center align-items-start py-2">
              <p className="flex-grow-1">
                {t('group.app.changeLanguage', {
                  lng: nextLng,
                })}
              </p>
              <Button className="ms-4" onClick={changeLanguage}>
                {t('group.app.button.changeLanguage')}
              </Button>
            </div>
          </Div>
        </Group>
      </Panel>
    </View>
  );
};

export default SettingsView;
