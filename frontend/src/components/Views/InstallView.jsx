import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useTranslations } from '../../../hooks';

const InstallView = (props) => {
  const [t] = useTranslations();
  const { id, activePanel, history } = props;

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
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
