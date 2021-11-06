import React from 'react';
import {
  Group, Panel, PanelHeader, SimpleCell, View,
} from '@vkontakte/vkui';
import { useLocation } from '@happysanta/router';
import { views, panels } from '../../../libs/router.js';
import { useTranslations } from '../../../hooks';

const CalendarView = () => {
  const location = useLocation();
  const [t] = useTranslations();

  return (
    <View
      activePanel={location.getViewActivePanel(views.CALENDAR)}
      history={location.hasOverlay() ? [] : location.getViewHistory(views.CALENDAR)}
    >
      <Panel id={panels.CALENDAR}>
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
