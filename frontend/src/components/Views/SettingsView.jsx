import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useTranslations } from '../../../hooks';

const SettingsView = (props) => {
  const [t] = useTranslations();
  const { id, activePanel, history } = props;

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader>{t('page.settings.title')}</PanelHeader>
        <Group>
          <SimpleCell>{'World '.repeat(10)}</SimpleCell>
        </Group>
      </Panel>
    </View>
  );
};

export default SettingsView;
