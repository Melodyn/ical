import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import { views, panels } from '../../../libs/router.js';
import { useTranslations } from '../../../hooks';

const InstallView = () => {
  const location = useLocation();
  const [t] = useTranslations();

  return (
    <View
      activePanel={location.getViewActivePanel(views.INSTALL)}
      history={location.hasOverlay() ? [] : location.getViewHistory(views.INSTALL)}
    >
      <Panel id={panels.INSTALL}>
        <PanelHeader role="heading">{t('page.install.title')}</PanelHeader>
        <Group>
          <SimpleCell>Kitty</SimpleCell>
          <SimpleCell>World</SimpleCell>
        </Group>
      </Panel>
    </View>
  );
};

export default InstallView;
