import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useTranslations } from '../../../hooks';

const CalendarView = (props) => {
  const [t] = useTranslations();
  const { id, activePanel, history } = props;

  return (
    <View {...{ id, activePanel, history }}>
      <Panel id={activePanel}>
        <PanelHeader role="heading">{t('page.calendar.title')}</PanelHeader>
        <Group>
          <SimpleCell />
          <SimpleCell>H</SimpleCell>
          <SimpleCell>e</SimpleCell>
          <SimpleCell>l</SimpleCell>
          <SimpleCell>l</SimpleCell>
          <SimpleCell>o</SimpleCell>
          <SimpleCell />
          <SimpleCell />
          <SimpleCell>K</SimpleCell>
          <SimpleCell>i</SimpleCell>
          <SimpleCell>t</SimpleCell>
          <SimpleCell>t</SimpleCell>
          <SimpleCell>y</SimpleCell>
          <SimpleCell />
          <SimpleCell />
        </Group>
      </Panel>
    </View>
  );
};

export default CalendarView;
