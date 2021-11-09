import React from 'react';
import {
  Group, Panel, PanelHeader, Header, View, Div,
} from '@vkontakte/vkui';
import { useTranslations, useScheme } from '../../../hooks';
import SettingsButton from '../Custom/SettingsButton.jsx';

const SettingsView = (props) => {
  const [tr, i18n] = useTranslations();
  const t = (name, params) => tr(`page.settings.${name}`, params);
  const [scheme, changeScheme] = useScheme();
  const { id, activePanel, history } = props;
  const nextLng = t(`group.app.invertedLanguage.${i18n.language}`);
  const nextScheme = t(`group.app.invertedScheme.${scheme}`);
  const changeLanguage = () => i18n.changeLanguage(nextLng);

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader>{t('header')}</PanelHeader>
        <Group>
          <Div>
            <Header className="ps-0">{t('group.calendar.header')}</Header>
          </Div>
        </Group>
        <Group>
          <Div>
            <Header className="ps-0">{t('group.app.header')}</Header>
            <SettingsButton
              description={t('group.app.changeScheme', { scheme: nextScheme })}
              buttonText={t('group.app.button.changeScheme')}
              onClick={changeScheme}
            />
            <SettingsButton
              description={t('group.app.changeLanguage', { lng: nextLng })}
              buttonText={t('group.app.button.changeLanguage')}
              onClick={changeLanguage}
            />
          </Div>
        </Group>
      </Panel>
    </View>
  );
};

export default SettingsView;
