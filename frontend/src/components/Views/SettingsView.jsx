import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import { views, panels } from '../../../libs/router.js';
import { useTranslations } from '../../../hooks';

const SettingsView = () => {
  const location = useLocation();
  const [t] = useTranslations();

  return (
    <View
      activePanel={location.getViewActivePanel(views.SETTINGS)}
      history={location.hasOverlay() ? [] : location.getViewHistory(views.SETTINGS)}
    >
      <Panel id={panels.SETTINGS}>
        <PanelHeader>{t('page.settings.title')}</PanelHeader>
        <Group>
          <SimpleCell>{'World '.repeat(10)}</SimpleCell>
        </Group>
      </Panel>
    </View>
  );
};

export default SettingsView;
