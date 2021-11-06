import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import { views, panels } from '../../../libs/router.js';
import { useTranslations } from '../../../hooks';

const HelpView = () => {
  const location = useLocation();
  const [t] = useTranslations();

  return (
    <View
      activePanel={location.getViewActivePanel(views.HELP)}
      history={location.hasOverlay() ? [] : location.getViewHistory(views.HELP)}
    >
      <Panel id={panels.HELP}>
        <PanelHeader role="heading">{t('page.help.title')}</PanelHeader>
        <Group>
          <SimpleCell>Kitty</SimpleCell>
          <SimpleCell>World</SimpleCell>
        </Group>
      </Panel>
    </View>
  );
};

export default HelpView;
